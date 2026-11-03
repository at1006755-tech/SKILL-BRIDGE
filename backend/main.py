import io
import re
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader

app = FastAPI(
    title="SkillBridge AI Backend",
    version="1.0.0",
    description="Career Intelligence & Resume Analysis Engine for College Students"
)

# -----------------------------
# CORS Middleware
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Career Roles & Requirements Database
# -----------------------------
CAREER_PROFILES = {
    "Software Developer": {
        "title": "Software Developer",
        "description": "Builds robust applications, problem solves with algorithms, and engineers backend/frontend systems.",
        "required_skills": [
            "Python", "Java", "C++", "DSA", "OOP", "SQL", "Git", "GitHub", "Problem Solving"
        ],
        "core_recommendations": [
            "Master Data Structures and Algorithms (Arrays, Trees, Graphs, Dynamic Programming).",
            "Build at least two full-stack or systems-level software projects.",
            "Practice Object-Oriented Design principles and design patterns.",
            "Actively maintain an active GitHub profile with clean READMEs and test coverage."
        ]
    },
    "Web Developer": {
        "title": "Web Developer",
        "description": "Designs and develops responsive, modern web applications from frontend interfaces to APIs.",
        "required_skills": [
            "HTML", "CSS", "JavaScript", "React", "Node.js", "Git", "GitHub", "REST APIs", "SQL"
        ],
        "core_recommendations": [
            "Build responsive user interfaces using modern CSS frameworks and React component architecture.",
            "Understand asynchronous JavaScript, state management, and REST API integration.",
            "Deploy full-stack projects to live hosting services like Vercel or Render."
        ]
    },
    "Backend Developer": {
        "title": "Backend Developer",
        "description": "Architects server-side logic, microservices, databases, authentication, and high-performance APIs.",
        "required_skills": [
            "Python", "Node.js", "FastAPI", "Django", "SQL", "MongoDB", "Git", "GitHub", "REST APIs"
        ],
        "core_recommendations": [
            "Design relational and NoSQL database schemas with indexing and query optimization.",
            "Implement robust JWT / OAuth authentication and security best practices.",
            "Containerize microservices using Docker and write integration tests."
        ]
    },
    "Data Analyst": {
        "title": "Data Analyst",
        "description": "Transforms raw datasets into business intelligence, reports, dashboards, and actionable insights.",
        "required_skills": [
            "Python", "SQL", "Excel", "Data Analysis", "Tableau", "Power BI", "Statistics", "Git"
        ],
        "core_recommendations": [
            "Master advanced SQL (Joins, Window Functions, CTEs) for querying large datasets.",
            "Learn exploratory data analysis using Pandas, NumPy, and Seaborn/Matplotlib.",
            "Create interactive dashboards in Power BI or Tableau demonstrating business ROI."
        ]
    },
    "Data Scientist": {
        "title": "Data Scientist",
        "description": "Develops predictive models, machine learning pipelines, and statistical algorithms to solve complex data challenges.",
        "required_skills": [
            "Python", "Machine Learning", "SQL", "Statistics", "Deep Learning", "Pandas", "NumPy", "Git"
        ],
        "core_recommendations": [
            "Solidify statistical foundations: probability distributions, hypothesis testing, and regression analysis.",
            "Build end-to-end Machine Learning pipelines with Scikit-Learn and cross-validation.",
            "Publish data analysis notebooks on Kaggle or GitHub with comprehensive documentation."
        ]
    },
    "AI ML Engineer": {
        "title": "AI / ML Engineer",
        "description": "Builds, optimizes, fine-tunes, and deploys intelligent models and AI-driven applications at scale.",
        "required_skills": [
            "Python", "Machine Learning", "Deep Learning", "FastAPI", "TensorFlow", "PyTorch", "AI", "NLP", "Git"
        ],
        "core_recommendations": [
            "Learn deep learning architectures (CNNs, Transformers, LLM fine-tuning, Embeddings).",
            "Serve machine learning models as production REST APIs using FastAPI and ONNX.",
            "Explore Retrieval-Augmented Generation (RAG) and vector databases."
        ]
    },
    "Cybersecurity": {
        "title": "Cybersecurity Analyst",
        "description": "Protects networks, systems, cloud infrastructure, and sensitive data against cyber threats and vulnerabilities.",
        "required_skills": [
            "Networking", "Linux", "Python", "Security", "Cryptography", "Ethical Hacking", "Git"
        ],
        "core_recommendations": [
            "Learn network protocols (TCP/IP, DNS, SSL/TLS) and firewall management.",
            "Practice hands-on penetration testing and vulnerability analysis in virtual labs.",
            "Prepare for industry certifications like CompTIA Security+ or CEH."
        ]
    }
}

# -----------------------------
# Comprehensive Skills Database with Regex Patterns
# -----------------------------
# Mapping skill display name -> regex pattern for safe boundary detection
SKILL_PATTERNS = {
    "Python": r"\bpython\b",
    "Java": r"\bjava\b(?!script)",
    "C": r"(?<!\w)c(?!\w|\+|#)",
    "C++": r"\bc\+\+\b|\bcpp\b",
    "C#": r"\bc#\b|\bc-sharp\b",
    "JavaScript": r"\bjavascript\b|\bjs\b",
    "TypeScript": r"\btypescript\b|\bts\b",
    "HTML": r"\bhtml\b|\bhtml5\b",
    "CSS": r"\bcss\b|\bcss3\b",
    "React": r"\breact\b|\breact\.js\b|\breactjs\b",
    "Node.js": r"\bnode\b|\bnode\.js\b|\bnodejs\b",
    "Express.js": r"\bexpress\b|\bexpress\.js\b",
    "FastAPI": r"\bfastapi\b",
    "Django": r"\bdjango\b",
    "Flask": r"\bflask\b",
    "SQL": r"\bsql\b|\bmysql\b|\bpostgresql\b|\bpostgres\b|\bsqlite\b",
    "MongoDB": r"\bmongodb\b|\bmongo\b",
    "Firebase": r"\bfirebase\b|\bfirestore\b",
    "Git": r"\bgit\b",
    "GitHub": r"\bgithub\b",
    "DSA": r"\bdsa\b|\bdata structures\b|\balgorithms\b",
    "OOP": r"\boop\b|\bobject oriented\b|\boops\b",
    "Machine Learning": r"\bmachine learning\b|\bml\b",
    "Deep Learning": r"\bdeep learning\b|\bdl\b",
    "AI": r"\bartificial intelligence\b|\bai\b",
    "NLP": r"\bnlp\b|\bnatural language processing\b",
    "Computer Vision": r"\bcomputer vision\b|\bcv\b",
    "TensorFlow": r"\btensorflow\b",
    "PyTorch": r"\bpytorch\b",
    "Pandas": r"\bpandas\b",
    "NumPy": r"\bnumpy\b",
    "Data Analysis": r"\bdata analysis\b|\bdata analytics\b",
    "Statistics": r"\bstatistics\b|\bstatistical\b",
    "Power BI": r"\bpower bi\b|\bpowerbi\b",
    "Tableau": r"\btableau\b",
    "Excel": r"\bexcel\b|\badvanced excel\b",
    "Docker": r"\bdocker\b",
    "Kubernetes": r"\bkubernetes\b|\bk8s\b",
    "AWS": r"\baws\b|\bamazon web services\b",
    "Linux": r"\blinux\b|\bunix\b",
    "Networking": r"\bnetworking\b|\bcomputer networks\b|\btcp/ip\b",
    "Security": r"\bcybersecurity\b|\bsecurity\b|\binformation security\b",
    "Cryptography": r"\bcryptography\b",
    "Ethical Hacking": r"\bethical hacking\b|\bpenetration testing\b|\bpen testing\b",
    "REST APIs": r"\brest api\b|\brest apis\b|\brestful\b|\bapi development\b",
    "Problem Solving": r"\bproblem solving\b|\bleetcode\b|\bhackerrank\b|\bcodeforces\b",
    "Responsive Design": r"\bresponsive design\b|\btailwind\b|\bbootstrap\b"
}

# -----------------------------
# Skill Detection
# -----------------------------
def detect_skills(text: str) -> List[str]:
    """Accurately detect technical skills using regex word boundary matching."""
    detected = []
    text_lower = text.lower()

    for skill, pattern in SKILL_PATTERNS.items():
        if re.search(pattern, text_lower, re.IGNORECASE):
            if skill not in detected:
                detected.append(skill)

    return detected

# -----------------------------
# Missing Skills Detection
# -----------------------------
def find_missing_skills(detected_skills: List[str], target_career: Optional[str] = None) -> List[str]:
    """Identify missing skills required for the student's chosen career."""
    career = CAREER_PROFILES.get(target_career or "Software Developer")
    if not career:
        # Fallback to Software Developer
        career = CAREER_PROFILES["Software Developer"]

    required = career["required_skills"]
    detected_lower = [s.lower() for s in detected_skills]

    missing = []
    for skill in required:
        if skill.lower() not in detected_lower:
            missing.append(skill)

    return missing

# -----------------------------
# Transparent Rule-Based Resume Scoring
# -----------------------------
def calculate_score(text: str, detected_skills: List[str]) -> tuple[int, dict]:
    """
    Calculates a transparent, rule-based resume quality score (0-100).
    Returns (total_score, breakdown_dictionary).
    """
    text_lower = text.lower()
    breakdown = {}

    # 1. Technical Skills (Max 40 pts)
    # Each detected verified skill gives 4 points, capped at 40
    tech_score = min(len(detected_skills) * 4, 40)
    breakdown["skills_score"] = tech_score

    # 2. Education Section (10 pts)
    edu_score = 0
    if re.search(r"\b(education|academic|b\.?tech|bca|mca|b\.?sc|university|college|cgpa|percentage)\b", text_lower):
        edu_score = 10
    breakdown["education_score"] = edu_score

    # 3. Projects Section (15 pts)
    proj_score = 0
    if re.search(r"\b(projects?|portfolio|built|developed|application|system)\b", text_lower):
        proj_score = 15
    breakdown["projects_score"] = proj_score

    # 4. Experience / Internships (10 pts)
    exp_score = 0
    if re.search(r"\b(experience|intern|internship|work experience|employment)\b", text_lower):
        exp_score = 10
    breakdown["experience_score"] = exp_score

    # 5. Achievements / Certifications (5 pts)
    achieve_score = 0
    if re.search(r"\b(achievement|achievements|certificate|certification|certified|honors?|awards?)\b", text_lower):
        achieve_score = 5
    breakdown["achievements_score"] = achieve_score

    # 6. Professional Presence - GitHub & LinkedIn (10 pts: 5 each)
    links_score = 0
    if "github" in text_lower:
        links_score += 5
    if "linkedin" in text_lower:
        links_score += 5
    breakdown["links_score"] = links_score

    # 7. Career Objective / Summary (10 pts)
    obj_score = 0
    if re.search(r"\b(objective|career objective|professional summary|about me|summary)\b", text_lower):
        obj_score = 10
    breakdown["objective_score"] = obj_score

    total_score = min(
        tech_score + edu_score + proj_score + exp_score + achieve_score + links_score + obj_score,
        100
    )
    return total_score, breakdown

# -----------------------------
# Recommendation Generator
# -----------------------------
def generate_recommendations(
    detected_skills: List[str],
    missing_skills: List[str],
    text: str,
    target_career: Optional[str] = None
) -> List[dict]:
    """Generate structured, actionable recommendations with priority levels."""
    recs = []
    text_lower = text.lower()
    detected_lower = [s.lower() for s in detected_skills]

    # Check missing skills priority
    for skill in missing_skills:
        if skill in ["DSA", "Data Structures", "Algorithms"]:
            recs.append({
                "topic": "Data Structures & Algorithms",
                "priority": "High",
                "reason": "Crucial for clearing technical interview coding rounds.",
                "action": "Strengthen foundational topics like Arrays, Strings, Searching, Sorting, and Binary Trees on LeetCode/GeeksforGeeks."
            })
        elif skill in ["React", "React.js"]:
            recs.append({
                "topic": "React.js & Frontend Architecture",
                "priority": "High",
                "reason": "High industry demand for dynamic single-page web development.",
                "action": "Build a responsive frontend project with hooks, component state, and API consumption."
            })
        elif skill in ["SQL"]:
            recs.append({
                "topic": "SQL & Relational Databases",
                "priority": "High",
                "reason": "Universal requirement across software engineering, data analysis, and backend roles.",
                "action": "Practice complex queries involving INNER/OUTER JOINs, GROUP BY, aggregations, and subqueries."
            })
        elif skill in ["Git", "GitHub"]:
            recs.append({
                "topic": "Version Control with Git & GitHub",
                "priority": "Medium",
                "reason": "Essential for collaboration and demonstrating proof-of-work to recruiters.",
                "action": "Commit your project codebase to GitHub with descriptive commit messages and a polished README.md."
            })
        elif skill in ["Python"]:
            recs.append({
                "topic": "Python Core & Scripting",
                "priority": "High",
                "reason": "Widely used across backend, automation, and data/AI applications.",
                "action": "Practice object-oriented Python, list comprehensions, file handling, and virtual environments."
            })
        elif skill in ["Machine Learning", "AI"]:
            recs.append({
                "topic": "Machine Learning Foundations",
                "priority": "High",
                "reason": "Key requirement for data science and AI roles.",
                "action": "Implement classification and regression pipelines using Scikit-Learn and evaluate with F1-score/RMSE."
            })
        else:
            recs.append({
                "topic": f"Master {skill}",
                "priority": "Medium",
                "reason": f"Required core competence for {target_career or 'Software Engineering'}.",
                "action": f"Dedicate structured practice hours to {skill} and complete a mini-project demonstrating mastery."
            })

    # Section-specific recommendations
    if not re.search(r"\b(projects?|built|developed)\b", text_lower):
        recs.append({
            "topic": "Add Practical Projects",
            "priority": "High",
            "reason": "Recruiters evaluate technical competency through hands-on project accomplishments.",
            "action": "Add 2-3 detailed project sections with technical stack used, challenges solved, and live demo/repo links."
        })

    if "github" not in text_lower:
        recs.append({
            "topic": "Include GitHub Profile Link",
            "priority": "Medium",
            "reason": "Engineers are evaluated on real, readable code.",
            "action": "Add your clean GitHub profile URL directly below your contact information."
        })

    if "linkedin" not in text_lower:
        recs.append({
            "topic": "Include LinkedIn Profile",
            "priority": "Medium",
            "reason": "Helps recruiters verify identity and review peer recommendations.",
            "action": "Add your customized LinkedIn public URL to the resume header."
        })

    if not recs:
        recs.append({
            "topic": "Portfolio Polish & Mock Interviews",
            "priority": "Low",
            "reason": "Your profile is well-rounded.",
            "action": "Participate in mock interviews and practice behavioral STAR-method question answering."
        })

    return recs

# -----------------------------
# Endpoints
# -----------------------------

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "SkillBridge AI Career Intelligence Engine",
        "version": "1.0.0",
        "message": "SkillBridge AI Backend is running smoothly 🚀"
    }

@app.get("/careers")
def get_careers():
    """Return all supported career profiles and required skills."""
    return {
        "success": True,
        "careers": CAREER_PROFILES
    }

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    target_career: Optional[str] = Form(None)
):
    """
    Analyzes an uploaded PDF resume:
    1. Validates and parses PDF via pypdf.
    2. Extracts detected skills with boundary-safe matching.
    3. Identifies skill gaps tailored to target_career.
    4. Calculates transparent rule-based quality score.
    5. Produces actionable recommendations.
    """
    # 1. Validate file format
    if not file.filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
        return {
            "success": False,
            "message": "Please upload a valid PDF document (.pdf format)."
        }

    try:
        contents = await file.read()
        if not contents or len(contents) == 0:
            return {
                "success": False,
                "message": "The uploaded PDF file is empty. Please choose a valid file."
            }

        pdf_file = io.BytesIO(contents)
        reader = PdfReader(pdf_file)

        if len(reader.pages) == 0:
            return {
                "success": False,
                "message": "The PDF does not contain any readable pages."
            }

        extracted_text = ""
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text + "\n"

        if not extracted_text.strip():
            return {
                "success": False,
                "message": "Could not extract text from the PDF. It may be an image scan. Please use a text-based PDF."
            }

        # Normalize target career
        selected_career = target_career if target_career in CAREER_PROFILES else "Software Developer"

        # 2. Detect Skills
        detected_skills = detect_skills(extracted_text)

        # 3. Missing Skills
        missing_skills = find_missing_skills(detected_skills, selected_career)

        # 4. Calculate Score & Breakdown
        resume_score, score_breakdown = calculate_score(extracted_text, detected_skills)

        # 5. Generate Recommendations
        recommendations = generate_recommendations(
            detected_skills,
            missing_skills,
            extracted_text,
            selected_career
        )

        # Format recommendation text strings for backwards-compatibility while keeping rich data
        rec_strings = [
            f"{r['topic']}: {r['action']}" for r in recommendations
        ]

        return {
            "success": True,
            "message": "Resume analyzed successfully!",
            "pages": len(reader.pages),
            "target_career": selected_career,
            "resume_score": resume_score,
            "score_breakdown": score_breakdown,
            "detected_skills": detected_skills,
            "missing_skills": missing_skills,
            "recommendations": rec_strings,
            "structured_recommendations": recommendations,
            "extracted_text": extracted_text[:4000] # Provide clean text sample
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"An error occurred while processing the PDF: {str(e)}"
        }