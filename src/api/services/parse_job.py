import json
from typing import List, Dict, Any
from pathlib import Path


# ======================================================
# A. LOAD SUPPORT MAPS (tech + soft)
# ======================================================
def load_support_maps():
    # services/ → api/ → src/ → HireMatch-AI/
    BASE_DIR = Path(__file__).resolve().parent
    SUPPORT_DIR = BASE_DIR.parent.parent.parent / "support"

    tech_path = SUPPORT_DIR / "tech_stack.json"
    soft_path = SUPPORT_DIR / "soft_skills.json"

    with tech_path.open("r", encoding="utf-8") as f:
        tech_map = json.load(f)

    with soft_path.open("r", encoding="utf-8") as f:
        soft_map = json.load(f)

    return tech_map, soft_map


# ======================================================
# B. EXTRACT SKILLS - retorna lista de categorias (macros)
# ======================================================
def extract_skill_categories(description: str, skill_map: dict) -> List[str]:
    """
    Extrai skills de uma descrição, retornando lista de categorias encontradas.
    """
    desc_lower = description.lower()
    found_categories = []

    for category, variations in skill_map.items():
        for v in variations:
            if v.lower() in desc_lower:
                found_categories.append(category)
                break  # encontrou uma variação, passa para próxima categoria

    return list(set(found_categories))


# ======================================================
# C. COMPUTE COMPATIBILITY SCORE
# ======================================================
def compute_compatibility_score(job_techs: List[str], job_soft: List[str],
                                 curr_techs: List[str], curr_soft: List[str]) -> float:
    """
    Calcula score de compatibilidade baseado em tech stacks e soft skills.
    Similar ao matching.py mas sem usar embedding/similarity.
    """
    # tech score
    total_tech = len(job_techs)
    tech_val = (
        sum(1 for cat in job_techs if cat in curr_techs) / total_tech
        if total_tech > 0 else 1
    )

    # soft score
    total_soft = len(job_soft)
    soft_val = (
        sum(1 for cat in job_soft if cat in curr_soft) / total_soft
        if total_soft > 0 else 1
    )

    # Score final: 60% tech + 40% soft (sem embedding para vagas customizadas)
    final = (0.6 * tech_val + 0.4 * soft_val) * 100

    return round(final, 2)


# ======================================================
# D. PARSE JOB AND CALCULATE SCORE
# ======================================================
def parse_job_with_score(job_description: str, curriculo: str) -> Dict[str, Any]:
    """
    Extrai tech stacks e soft skills da vaga e do currículo,
    calcula o score de compatibilidade.
    """
    tech_map, soft_map = load_support_maps()

    # Extrair categorias da vaga
    job_techs = extract_skill_categories(job_description, tech_map)
    job_soft = extract_skill_categories(job_description, soft_map)

    # Extrair categorias do currículo
    curr_techs = extract_skill_categories(curriculo, tech_map)
    curr_soft = extract_skill_categories(curriculo, soft_map)

    # Calcular score
    score = compute_compatibility_score(job_techs, job_soft, curr_techs, curr_soft)

    return {
        "score": score,
    }
