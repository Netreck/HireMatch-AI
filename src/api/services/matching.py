import os
import re
from typing import List, Dict, Any
from pathlib import Path

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone
from supabase import create_client, Client


# ======================================================
# A. LOAD SUPPORT MAPS (tech + soft)
# ======================================================
def load_support_maps():
    import json

    # services/ → api/ → src/ → HireMatch-AI/
    BASE_DIR = Path(__file__).resolve().parent
    SUPPORT_DIR = BASE_DIR.parent.parent.parent / "support"

    tech_path = SUPPORT_DIR / "tech_stack.json"
    soft_path = SUPPORT_DIR / "soft_skills.json"

    with tech_path.open("r", encoding="utf-8") as f:
        tech_map = json.load(f)

    with soft_path.open("r", encoding="utf-8") as f:
        soft_map = json.load(f)

    tech_map = {k.lower(): [v.lower() for v in values] for k, values in tech_map.items()}
    soft_map = {k.lower(): [v.lower() for v in values] for k, values in soft_map.items()}

    return tech_map, soft_map


# ======================================================
# B. EXTRACT SKILLS FROM DESCRIPTION
# ======================================================
def extract_skill_map(description: str, skill_map: dict):
    desc = description.lower()
    found = {}

    for macro, variations in skill_map.items():
        for v in variations:
            if v in desc:
                found[macro] = found.get(macro, []) + [v]

    # Remove duplicatas
    found = {k: list(set(v)) for k, v in found.items()}
    return desc, list(found.keys())   # retorna apenas a lista de macros


# ======================================================
# C. COMPUTE FINAL SCORE
# ======================================================
def compute_final_score(similarity_raw, sim_min, sim_max,
                        job_techs, job_soft,
                        curr_techs, curr_soft):

    similarity_norm = (similarity_raw - sim_min) / (sim_max - sim_min + 1e-9)
    similarity_norm = max(0, min(1, similarity_norm))

    # tech score
    total_tech = len(job_techs)
    tech_val = (
        sum(1 for macro in job_techs if macro in curr_techs) / total_tech
        if total_tech > 0 else 1
    )

    # soft score
    total_soft = len(job_soft)
    soft_val = (
        sum(1 for macro in job_soft if macro in curr_soft) / total_soft
        if total_soft > 0 else 1
    )

    final = (
        0.7 * similarity_norm +
        0.1 * tech_val +
        0.2 * soft_val
    ) * 100

    return round(final, 2)


# ======================================================
# 1. Gera embedding do currículo
# ======================================================
def process_curriculo(curriculo: str) -> List[float]:
    load_dotenv()
    api_key = os.getenv("api_key_openai") or os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("OPENAI_API_KEY/api_key_openai não encontrado no ambiente (.env ou variáveis).")

    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=api_key
    )

    return embeddings.embed_query(curriculo)


# ======================================================
# 2. Consulta Pinecone e retorna id + similarity
# ======================================================
def buscar_ids_similaridade(curriculo_emb: List[float], top_k: int = 50) -> List[Dict[str, Any]]:
    load_dotenv()
    pinecone_key = os.getenv("pinecone_key") or os.getenv("PINECONE_API_KEY")

    if not pinecone_key:
        raise ValueError("pinecone_key/PINECONE_API_KEY não encontrado no .env ou variáveis")

    pc = Pinecone(api_key=pinecone_key)
    index = pc.Index("hirematch-jobs")

    res = index.query(
        vector=curriculo_emb,
        top_k=top_k,
        include_metadata=False,
        include_values=False,
    )

    saida = []
    for m in res["matches"]:
        saida.append({
            "id": str(m["id"]),
            "similarity": float(m["score"])
        })

    return saida


# ======================================================
# 3. Busca vagas no Supabase usando os IDs
# ======================================================
def buscar_vagas_supabase(ids: List[str]) -> List[Dict[str, Any]]:
    load_dotenv()
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL ou SUPABASE_KEY não encontrados no .env")

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = supabase.table("jobs").select("*").in_("id", ids).execute()

    return response.data if hasattr(response, "data") else []


# ======================================================
# 4. Remove embeddings e campos gigantes
# ======================================================
def sanitizar_vaga(vaga: Dict[str, Any], similarity: float) -> Dict[str, Any]:
    cleaned: Dict[str, Any] = {}

    for k, v in vaga.items():
        key_lower = str(k).lower()
        if "emb" in key_lower:
            continue
        if isinstance(v, (list, tuple)) and len(v) > 64:
            continue
        cleaned[k] = v

    cleaned["similarity"] = float(similarity)
    return cleaned


# ======================================================
# 5. PIPELINE FINAL — currículo → pinecone → supabase → score
# ======================================================
def pipeline_matching(curriculo_texto: str,
                      top_k: int = 50) -> List[Dict[str, Any]]:

    # -------------------------
    # 1. embedding do currículo
    # -------------------------
    curriculo_emb = process_curriculo(curriculo_texto)

    # Limpamos texto do currículo para extrair skills
    curriculo_clean = re.sub(r"\s+", " ", curriculo_texto).strip()

    # load support maps
    tech_map, soft_map = load_support_maps()

    # extração de skills do currículo
    _, curr_techs = extract_skill_map(curriculo_clean, tech_map)
    _, curr_soft = extract_skill_map(curriculo_clean, soft_map)

    # -------------------------
    # 2. buscar top K no Pinecone
    # -------------------------
    matches = buscar_ids_similaridade(curriculo_emb, top_k=top_k)
    ids = [m["id"] for m in matches]
    similarity_map = {m["id"]: m["similarity"] for m in matches}

    if not matches:
        return []

    sim_values = [m["similarity"] for m in matches]
    sim_min, sim_max = min(sim_values), max(sim_values)

    # -------------------------
    # 3. buscar vagas no Supabase
    # -------------------------
    vagas = buscar_vagas_supabase(ids)

    # -------------------------
    # 4. montar objeto final
    # -------------------------
    vagas_final: List[Dict[str, Any]] = []

    for vaga in vagas:
        vid = str(vaga.get("id"))
        sim = similarity_map.get(vid, 0.0)

        # sanitizar (remove embeddings)
        vaga_limpa = sanitizar_vaga(vaga, sim)

        # extrair techs/softs da vaga
        desc = vaga_limpa.get("description", "")
        _, job_techs = extract_skill_map(desc, tech_map)
        _, job_soft = extract_skill_map(desc, soft_map)

        # calcular NOTA FINAL
        final_score = compute_final_score(
            sim, sim_min, sim_max,
            job_techs, job_soft,
            curr_techs, curr_soft
        )

        vaga_limpa["final_score"] = final_score
        vagas_final.append(vaga_limpa)

    return vagas_final
