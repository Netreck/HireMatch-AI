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
Você é um especialista em RH e LaTeX.
Gere um currículo final em LaTeX completo (sem markdown, sem JSON) usando EXATAMENTE o modelo base abaixo como referência de estrutura/estilo.

Requisitos:
- Retorne somente LaTeX.
- Use o preâmbulo e comandos do modelo fornecido (documentclass{{resume}}, geometry, \\name, \\address, rSection etc.).
- Substitua os conteúdos das seções pelo que for mais relevante do currículo para a vaga.
- Mantenha tom profissional, direto e conciso; use bullet points em experiências.
- Escape caracteres especiais do LaTeX (% _ & # $) quando necessário.
- Se algo do currículo não for relevante, resuma ou omita.
- use palavras chaves e coisas que contribuam para uma ia entender melhor o curriculo
MODELO BASE (mantenha estrutura e `comandos`, adaptando apenas o conteúdo):

\\documentclass{{resume}} % Use the custom resume.cls style

\\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{{geometry}} % Document margins
\\newcommand{{\\tab}}[1]{{\\hspace{{.2667\\textwidth}}\\rlap{{#1}}}} 
\\newcommand{{\\itab}}[1]{{\\hspace{{0em}}\\rlap{{#1}}}}
\\name{{Gabriel Victor Lima Gonçalves}} % Your name
\\address{{+55 (11)94924-4811 \\\\ Santo André, SP}} 
\\address{{\\href{{mailto:gabrielvgonc@gmail.com}}{{gabrielvgonc@gmail.com}} \\\\ \\href{{www.linkedin.com/in/gabriel-victor-71187b223}}{{www.linkedin.com/in/gabriel-victor-71187b223}}}} 
\\\\  

\\begin{{document}}

%----------------------------------------------------------------------------------------
%	OBJECTIVE
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Objective}}

Seeking career growth opportunities in the field of software development.

\\end{{rSection}}

%----------------------------------------------------------------------------------------
%	EDUCATION
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Education}}

{{\\bf Bachelor of Computer Science}}, Universidade Federal do ABC \\hfill {{Expected Graduation: 2026}}\\\\ 

\\end{{rSection}}

%----------------------------------------------------------------------------------------
% TECHNICAL STRENGTHS	
%----------------------------------------------------------------------------------------
\\begin{{rSection}}{{Skills}}

\\begin{{tabular}}{{ @{{}} >{{\\bfseries}}l @{{\\hspace{{6ex}}}} l }}
Main Technical Skills & Python, SQL, ETL, Java, Git \\\\
Soft Skills & Communication, Adaptability, Analytical Thinking, Proactivity \\\\
Github Portfolio & \\href{{https://github.com/Netreck}}{{https://github.com/Netreck}} \\\\
Languages & English, Portuguese
\\end{{tabular}}\\\\

\\end{{rSection}}

%----------------------------------------------------------------------------------------
% PROFESSIONAL EXPERIENCE
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Professional Experience}}

\\textbf{{Intern – Bank of America}} \\hfill Jun 2025 -- Present \\\\
\\textit{{VP Global Technology -- Tech Rotation Program}}
\\begin{{itemize}}
    \\item Developed test automation and tools to support QA teams in payment systems.
    \\item Contributed to internal automation and process optimization projects.
    \\item Technologies: Java, Python, Git, SQL, Node.js, HTML, CSS, Octane, QTest, Matera.
\\end{{itemize}}

\\end{{rSection}}

%----------------------------------------------------------------------------------------
% EXTRACURRICULAR ACTIVITIES
%----------------------------------------------------------------------------------------

\\begin{{rSection}}{{Extracurricular Activities}}

\\textbf{{Member – Green Team Hacker Club}} \\hfill Jan 2024 -- Jan 2025 \\\\
\\textbf{{Project Manager – Data Projects, Green Team Hacker Club}} \\hfill Jan 2025 -- Present \\\\
Federal University of ABC (UFABC) \\hfill \\textit{{Santo André, SP}}
 \\begin{{itemize}}
    \\itemsep -3pt {{}} 
    \\item Official student-led organization linked to UFABC. 
    \\item Participated in classes and projects related to Data Science.
    \\item Defined and managed technology stack for projects, considering scalability, performance, and integration.
    \\item Managed team activities including task delegation, progress tracking, and technical support.
    \\item Worked with ETL, process automation (pipelines), SQL, PostgreSQL, Data Visualization (Seaborn, Matplotlib), Data Modeling, Machine Learning models (Scikit-learn, TensorFlow), model deployment via APIs, MLflow, and LLMs. 
 \\end{{itemize}}
 
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
        model="gpt-4.1-mini",
        temperature=0.3,
        messages=[
            {
                "role": "system",
                "content": "Você gera currículos em LaTeX prontos para compilação. Nunca retorne Markdown nem JSON.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    tex_raw = response.choices[0].message.content if response.choices else ""
    tex_clean = _strip_code_fences(tex_raw)

    return {"tex": tex_clean}
