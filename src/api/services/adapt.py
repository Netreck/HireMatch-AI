"""
Gera um currículo adaptado em LaTeX usando o modelo resume.cls fornecido
e retorna apenas o código .tex (sem conversão para PDF).
"""

import os
from typing import Dict

from dotenv import load_dotenv
from openai import OpenAI


# ======================================================
# A. LOAD ENV + CLIENT
# ======================================================
def load_openai_key() -> str:
    load_dotenv()
    key = (
        os.getenv("openai")
        or os.getenv("OPENAI_API_KEY")
        or os.getenv("api_key_openai")
    )
    if not key:
        raise ValueError("Chave da OpenAI não encontrada no ambiente (.env)")
    return key


def create_client() -> OpenAI:
    api_key = load_openai_key()
    return OpenAI(api_key=api_key)


# ======================================================
# B. PROMPT
# ======================================================
def build_prompt(curriculo: str, vaga: str) -> str:
    return f"""
Você é um especialista em RH, e LaTeX.
Você recebera um curriculo e uma vaga, adapte o curriculo enviado para ser mais compativel com a vaga  
Gere **um currículo final em LaTeX completo**, usando EXATAMENTE a estrutura do modelo abaixo.

Regras obrigatórias e definicoes:
- Retorne **somente LaTeX**, sem explicações, sem markdown.
- Não invente informações que nao estao no curriculo original
- Preserve todos os comandos, seções e estrutura do modelo.
- Substitua cada seção com conteúdo otimizado para a vaga, natural, profissional e conciso.
- Use palavras-chave técnicas e comportamentais relevantes da vaga.
- Mantenha frases diretas, foco em impacto e alinhamento com a descrição do cargo.
- Escape caracteres especiais do LaTeX.
- Cada seção do modelo contém **somente uma descrição curta** indicando o que deve ser colocado ali.
- Retorne sempre o curriculo em ingles
MODELO BASE (mantenha estrutura e comandos):

\\documentclass{{resume}}

\\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{{geometry}}
\\newcommand{{\\tab}}[1]{{\\hspace{{.2667\\textwidth}}\\rlap{{#1}}}}
\\newcommand{{\\itab}}[1]{{\\hspace{{0em}}\\rlap{{#1}}}}

\\name{{[Nome Completo]}}
\\address{{[Telefone] \\\\ [Cidade, Estado]}}
\\address{{\\href{{mailto:[email]}}{{[email]}} \\\\ \\href{{[linkedin]}}{{[linkedin]}}}}
\\\\

\\begin{{document}}

%----------------------------------------------------------------------------------------
%	OBJECTIVE
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Objective}}
(Resumo curto de 1--2 linhas sobre objetivos profissionais alinhados à vaga.)
\\end{{rSection}}

%----------------------------------------------------------------------------------------
%	EDUCATION
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Education}}
(Listar formação acadêmica principal, curso, instituição e datas.)
\\end{{rSection}}

%----------------------------------------------------------------------------------------
% SKILLS
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Skills}}
(Tabela resumida com habilidades técnicas relevantes, soft skills e idiomas.)
\\end{{rSection}}

%----------------------------------------------------------------------------------------
% PROFESSIONAL EXPERIENCE
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Professional Experience}}
(Listar experiências profissionais mais relevantes com bullets objetivos focados em impacto e tecnologias.)
\\end{{rSection}}

%----------------------------------------------------------------------------------------
% EXTRACURRICULAR ACTIVITIES
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Extracurricular Activities}}
(Projetos, grupos, iniciativas ou atividades relevantes para a vaga.)
\\end{{rSection}}

\\end{{document}}

CURRÍCULO ORIGINAL:
{curriculo}

DESCRIÇÃO DA VAGA:
{vaga}
"""


def _strip_code_fences(text: str) -> str:
    if not text:
        return ""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if len(lines) >= 2 and lines[0].startswith("```") and lines[-1].startswith("```"):
            cleaned = "\n".join(lines[1:-1]).strip()
    return cleaned


# ======================================================
# C. MAIN FUNCTION
# ======================================================
def gerar_curriculo_adaptado(curriculo: str, vaga: str) -> Dict[str, str]:
    client = create_client()
    prompt = build_prompt(curriculo, vaga)

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {
                "role": "system",
                "content": "Você gera currículos em LaTeX utilizando um curriculo base e uma descrição de vaga prontos para compilação. Nunca retorne Markdown nem JSON.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    tex_raw = response.choices[0].message.content if response.choices else ""
    tex_clean = _strip_code_fences(tex_raw)

    return {"tex": tex_clean}
