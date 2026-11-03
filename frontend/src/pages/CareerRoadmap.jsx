import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./CareerRoadmap.css";

// Comprehensive Career Roadmap Templates
const ROADMAP_TEMPLATES = {
  "Software Developer": [
    {
      id: "sd-phase-1",
      number: "01",
      title: "Programming Fundamentals & Clean Code",
      duration: "3-4 Weeks",
      relatedSkills: ["Python", "Java", "C++", "Programming Fundamentals"],
      description: "Master variables, memory allocation, conditionals, loops, functions, and modular code architecture.",
      objectives: [
        "Write clean, idiomatic code with proper naming conventions and modular functions.",
        "Understand time and space complexity with Big-O notation.",
        "Implement basic recursion, sorting, and linear search algorithms."
      ],
      tasks: [
        { id: "sd-1-1", text: "Complete 25 basic syntax & logic problems in your chosen primary language (Python/Java/C++)." },
        { id: "sd-1-2", text: "Implement iterative and recursive Fibonacci, Factorial, and Palindrome checkers." },
        { id: "sd-1-3", text: "Build a CLI application (e.g. Student Management or Task Tracker) using file I/O." }
      ],
      resources: [
        { name: "freeCodeCamp Python", url: "https://www.freecodecamp.org/learn" },
        { name: "GeeksforGeeks Basics", url: "https://www.geeksforgeeks.org/" }
      ]
    },
    {
      id: "sd-phase-2",
      number: "02",
      title: "Data Structures & Algorithms (Core DSA)",
      duration: "6-8 Weeks",
      relatedSkills: ["DSA", "Data Structures", "Algorithms", "Problem Solving"],
      description: "Essential foundational concepts for technical interview rounds and algorithmic problem solving.",
      objectives: [
        "Master linear structures: Dynamic Arrays, Linked Lists, Stacks, Queues.",
        "Master non-linear structures: Binary Trees, BSTs, Heaps, and Graph Traversals (BFS/DFS).",
        "Practice two-pointer techniques, sliding window, and divide-and-conquer."
      ],
      tasks: [
        { id: "sd-2-1", text: "Solve 50 LeetCode Easy & Medium problems focusing on Arrays and Strings." },
        { id: "sd-2-2", text: "Implement singly and doubly Linked Lists from scratch without libraries." },
        { id: "sd-2-3", text: "Solve 20 Tree traversal problems (Inorder, Preorder, Postorder, Level Order)." },
        { id: "sd-2-4", text: "Implement BFS and DFS graph search algorithms on adjacency lists." }
      ],
      resources: [
        { name: "LeetCode 75", url: "https://leetcode.com/studyplan/leetcode-75/" },
        { name: "NeetCode Roadmap", url: "https://neetcode.io/roadmap" }
      ]
    },
    {
      id: "sd-phase-3",
      number: "03",
      title: "Object-Oriented Programming & Low-Level Design",
      duration: "3 Weeks",
      relatedSkills: ["OOP", "Java", "C++", "Python"],
      description: "Learn how to structure enterprise applications using SOLID principles and design patterns.",
      objectives: [
        "Deeply understand Encapsulation, Abstraction, Inheritance, and Polymorphism.",
        "Apply SOLID design principles to eliminate tight coupling.",
        "Implement Singleton, Factory, and Observer design patterns."
      ],
      tasks: [
        { id: "sd-3-1", text: "Design a Parking Lot or Library Management System following OOP principles." },
        { id: "sd-3-2", text: "Implement Abstract Classes and Interfaces to decouple business logic." },
        { id: "sd-3-3", text: "Write unit tests for your classes using pytest or JUnit." }
      ],
      resources: [
        { name: "Refactoring Guru: Design Patterns", url: "https://refactoring.guru/design-patterns" },
        { name: "SOLID Principles in Practice", url: "https://www.freecodecamp.org/" }
      ]
    },
    {
      id: "sd-phase-4",
      number: "04",
      title: "Database Management Systems & SQL",
      duration: "3-4 Weeks",
      relatedSkills: ["SQL", "MongoDB", "Database"],
      description: "Data modeling, relational theory, complex querying, normalization, and indexing.",
      objectives: [
        "Write complex SQL queries involving INNER/LEFT JOINs, Subqueries, and Aggregations.",
        "Normalize database tables from 1NF up to 3NF/BCNF.",
        "Understand transaction ACID properties and database indexing for query speed."
      ],
      tasks: [
        { id: "sd-4-1", text: "Design an E-commerce relational database schema with foreign key constraints." },
        { id: "sd-4-2", text: "Complete SQL 50 study plan on LeetCode or HackerRank SQL domain." },
        { id: "sd-4-3", text: "Practice database indexing and analyze query execution plans with EXPLAIN." }
      ],
      resources: [
        { name: "SQLZoo Interactive Tutorials", url: "https://sqlzoo.net/" },
        { name: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/" }
      ]
    },
    {
      id: "sd-phase-5",
      number: "05",
      title: "Version Control with Git & GitHub",
      duration: "1-2 Weeks",
      relatedSkills: ["Git", "GitHub"],
      description: "Professional collaborative workflow, branch strategies, pull requests, and open source hygiene.",
      objectives: [
        "Master git branch, merge, rebase, and conflict resolution.",
        "Create structured pull requests with clear issue linking.",
        "Set up GitHub Actions for basic linting and automated test runs."
      ],
      tasks: [
        { id: "sd-5-1", text: "Initialize a Git repository and practice branch-based feature development." },
        { id: "sd-5-2", text: "Simulate and resolve a git merge conflict between two feature branches." },
        { id: "sd-5-3", text: "Write a high-quality Markdown README.md with screenshots and setup instructions." }
      ],
      resources: [
        { name: "Git Immersion", url: "https://gitimmersion.com/" },
        { name: "GitHub Skills Labs", url: "https://skills.github.com/" }
      ]
    },
    {
      id: "sd-phase-6",
      number: "06",
      title: "Full-Stack Project Development",
      duration: "4-5 Weeks",
      relatedSkills: ["React", "Node.js", "FastAPI", "HTML", "CSS"],
      description: "Build a production-grade full-stack project demonstrating architecture and deployment.",
      objectives: [
        "Connect a frontend UI (React) with a RESTful backend API (FastAPI / Express).",
        "Implement user authentication with JWT or Firebase Auth.",
        "Deploy both frontend and backend to live cloud hosting."
      ],
      tasks: [
        { id: "sd-6-1", text: "Develop a complete web app with CRUD operations, auth, and database persistence." },
        { id: "sd-6-2", text: "Implement client-side validation and responsive mobile layouts." },
        { id: "sd-6-3", text: "Deploy to Vercel/Render and verify live API endpoints with CORS." }
      ],
      resources: [
        { name: "The Odin Project", url: "https://www.theodinproject.com/" },
        { name: "Full Stack Open", url: "https://fullstackopen.com/en/" }
      ]
    },
    {
      id: "sd-phase-7",
      number: "07",
      title: "Technical Interview & Placement Preparation",
      duration: "4 Weeks",
      relatedSkills: ["Problem Solving", "DSA", "OOP"],
      description: "Targeted placement preparation: mock interviews, CS fundamentals, and resume polishing.",
      objectives: [
        "Revise Operating Systems (Processes, Threads, Deadlocks, Memory Management).",
        "Revise Computer Networks (OSI, TCP/IP, HTTP/HTTPS, DNS).",
        "Master STAR-method behavioral question responses."
      ],
      tasks: [
        { id: "sd-7-1", text: "Complete 10 timed mock coding assessments on HackerRank or LeetCode." },
        { id: "sd-7-2", text: "Review Top 50 OS, DBMS, and CN interview questions." },
        { id: "sd-7-3", text: "Conduct a peer mock interview and polish resume bullet points with quantifiable metrics." }
      ],
      resources: [
        { name: "Gate Smashers CS Fundamentals", url: "https://www.youtube.com/@GateSmashers" },
        { name: "Pramp Mock Interviews", url: "https://www.pramp.com/" }
      ]
    }
  ],
  "Web Developer": [
    {
      id: "wd-phase-1",
      number: "01",
      title: "Modern HTML5 & Semantic Web",
      duration: "2 Weeks",
      relatedSkills: ["HTML"],
      description: "Semantic markup, form validation, accessible DOM structure, and web standards.",
      objectives: ["Master semantic tags (header, nav, main, article, section, footer).", "Implement accessible HTML forms."],
      tasks: [
        { id: "wd-1-1", text: "Build a multi-page semantic website without frameworks." },
        { id: "wd-1-2", text: "Create accessible forms with client-side pattern validation." }
      ],
      resources: [{ name: "MDN HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" }]
    },
    {
      id: "wd-phase-2",
      number: "02",
      title: "CSS3, Flexbox, Grid & Responsive Design",
      duration: "3 Weeks",
      relatedSkills: ["CSS", "Responsive Design"],
      description: "Modern layouts, Flexbox, CSS Grid, media queries, and responsive mobile-first design.",
      objectives: ["Create responsive layouts that adapt cleanly from mobile to 4K monitors.", "Master CSS variables."],
      tasks: [
        { id: "wd-2-1", text: "Build a responsive landing page using Flexbox and CSS Grid." },
        { id: "wd-2-2", text: "Implement a dark mode toggle using CSS Custom Properties." }
      ],
      resources: [{ name: "CSS Tricks: Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }]
    },
    {
      id: "wd-phase-3",
      number: "03",
      title: "Modern JavaScript (ES6+)",
      duration: "4 Weeks",
      relatedSkills: ["JavaScript"],
      description: "Arrow functions, destructuring, modules, DOM manipulation, promises, async/await.",
      objectives: ["Master asynchronous JavaScript and Fetch API.", "Understand closures, event bubbling, and the event loop."],
      tasks: [
        { id: "wd-3-1", text: "Build an interactive Weather Dashboard using public APIs and async/await." },
        { id: "wd-3-2", text: "Create a client-side search and filtering component with debounce." }
      ],
      resources: [{ name: "javascript.info", url: "https://javascript.info/" }]
    },
    {
      id: "wd-phase-4",
      number: "04",
      title: "React.js Framework & State Architecture",
      duration: "4-5 Weeks",
      relatedSkills: ["React", "React.js"],
      description: "Components, JSX, useState, useEffect, custom hooks, context API, and SPA routing.",
      objectives: ["Build reactive single-page applications with reusable component hierarchy."],
      tasks: [
        { id: "wd-4-1", text: "Build an interactive E-Commerce Product Catalog with cart state management." },
        { id: "wd-4-2", text: "Create a custom useFetch or useLocalStorage React hook." }
      ],
      resources: [{ name: "React Official Docs", url: "https://react.dev/" }]
    },
    {
      id: "wd-phase-5",
      number: "05",
      title: "Backend Integration & REST APIs",
      duration: "3 Weeks",
      relatedSkills: ["Node.js", "REST APIs", "SQL", "MongoDB"],
      description: "Connecting React frontend with Node/Express or FastAPI backends and databases.",
      objectives: ["Implement secure token authentication and CRUD database integration."],
      tasks: [
        { id: "wd-5-1", text: "Build a full-stack MERN or React+FastAPI application." },
        { id: "wd-5-2", text: "Deploy frontend on Vercel and backend on Render." }
      ],
      resources: [{ name: "Full Stack Open", url: "https://fullstackopen.com/" }]
    }
  ],
  "Backend Developer": [
    {
      id: "bd-phase-1", number: "01", title: "Programming & Backend Fundamentals", duration: "3-4 Weeks",
      relatedSkills: ["Python", "Java", "Node.js", "Programming Fundamentals"],
      description: "Build a strong programming foundation and understand how server-side applications work.",
      objectives: ["Practice variables, functions, OOP, error handling and modular code.", "Understand client-server architecture and HTTP request/response flow."],
      tasks: [
        { id: "bd-1-1", text: "Solve 25 beginner programming problems in Python, Java or JavaScript." },
        { id: "bd-1-2", text: "Build a command-line contact or expense manager using file handling." },
        { id: "bd-1-3", text: "Use Postman or browser tools to inspect basic HTTP requests and responses." }
      ],
      resources: [{ name: "Python Tutorial", url: "https://docs.python.org/3/tutorial/" }, { name: "MDN HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" }]
    },
    {
      id: "bd-phase-2", number: "02", title: "Server Development & REST APIs", duration: "4-5 Weeks",
      relatedSkills: ["Node.js", "Express", "FastAPI", "REST API"],
      description: "Create server routes, handle requests, validate input and build reliable APIs.",
      objectives: ["Understand routing, middleware, status codes and JSON.", "Create CRUD endpoints with validation and error handling."],
      tasks: [
        { id: "bd-2-1", text: "Build a REST API for a notes or task-management application." },
        { id: "bd-2-2", text: "Add request validation, reusable error handling and API documentation." },
        { id: "bd-2-3", text: "Test all API routes and edge cases using Postman." }
      ],
      resources: [{ name: "Express Guide", url: "https://expressjs.com/en/guide/routing.html" }, { name: "FastAPI Tutorial", url: "https://fastapi.tiangolo.com/tutorial/" }]
    },
    {
      id: "bd-phase-3", number: "03", title: "Databases, Authentication & Security", duration: "4 Weeks",
      relatedSkills: ["SQL", "MongoDB", "Firebase", "Authentication", "Database"],
      description: "Store application data safely and protect routes with authentication and authorization.",
      objectives: ["Learn SQL tables, relationships, joins and basic indexing.", "Understand password hashing, sessions/tokens and access control."],
      tasks: [
        { id: "bd-3-1", text: "Design a relational database for a student or inventory application." },
        { id: "bd-3-2", text: "Connect your API to a database and implement CRUD operations." },
        { id: "bd-3-3", text: "Add login, protected routes and user-specific data access." }
      ],
      resources: [{ name: "SQLBolt", url: "https://sqlbolt.com/" }, { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" }]
    },
    {
      id: "bd-phase-4", number: "04", title: "Deployment, Testing & Portfolio Project", duration: "4-5 Weeks",
      relatedSkills: ["Git", "GitHub", "Docker", "Cloud", "Testing"],
      description: "Prepare a backend project for real users with testing, documentation and deployment.",
      objectives: ["Use Git branches and environment variables safely.", "Understand logging, basic testing and deployment."],
      tasks: [
        { id: "bd-4-1", text: "Write API tests for successful, invalid and unauthorized requests." },
        { id: "bd-4-2", text: "Deploy your API and database-backed application to a hosting platform." },
        { id: "bd-4-3", text: "Publish a README with setup steps, API examples and project screenshots." }
      ],
      resources: [{ name: "GitHub Skills", url: "https://skills.github.com/" }, { name: "Render Docs", url: "https://render.com/docs" }]
    }
  ],
  "Data Analyst": [
    {
      id: "da-phase-1", number: "01", title: "Excel, Data Basics & Statistics", duration: "3-4 Weeks",
      relatedSkills: ["Excel", "Statistics", "Data Analysis"],
      description: "Learn how to organize, clean and understand datasets before drawing conclusions.",
      objectives: ["Use spreadsheets, formulas, sorting, filtering and pivot tables.", "Understand mean, median, mode, percentages and basic distributions."],
      tasks: [
        { id: "da-1-1", text: "Clean a messy sales or student dataset in Excel or Google Sheets." },
        { id: "da-1-2", text: "Create pivot tables and a chart-based summary report." },
        { id: "da-1-3", text: "Calculate and explain mean, median, percentage change and outliers." }
      ],
      resources: [{ name: "Microsoft Excel Help", url: "https://support.microsoft.com/excel" }, { name: "Khan Academy Statistics", url: "https://www.khanacademy.org/math/statistics-probability" }]
    },
    {
      id: "da-phase-2", number: "02", title: "SQL for Data Analysis", duration: "3-4 Weeks",
      relatedSkills: ["SQL", "MySQL", "PostgreSQL", "Database"],
      description: "Query structured data and answer business questions using SQL.",
      objectives: ["Learn SELECT, WHERE, GROUP BY, HAVING and JOIN.", "Use subqueries and aggregate functions to summarize data."],
      tasks: [
        { id: "da-2-1", text: "Complete 30 beginner SQL practice questions." },
        { id: "da-2-2", text: "Write queries to find top products, monthly sales and customer trends." },
        { id: "da-2-3", text: "Create a small relational database and document its schema." }
      ],
      resources: [{ name: "SQLBolt", url: "https://sqlbolt.com/" }, { name: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/" }]
    },
    {
      id: "da-phase-3", number: "03", title: "Python, Pandas & Data Visualization", duration: "5-6 Weeks",
      relatedSkills: ["Python", "Pandas", "NumPy", "Matplotlib", "Data Visualization"],
      description: "Use Python to clean, explore and visualize datasets efficiently.",
      objectives: ["Load, filter, group and transform data with Pandas.", "Create meaningful charts and explain patterns in data."],
      tasks: [
        { id: "da-3-1", text: "Analyze a public dataset using Pandas and NumPy." },
        { id: "da-3-2", text: "Handle missing values, duplicates and inconsistent data." },
        { id: "da-3-3", text: "Create at least five clear charts using Matplotlib or Power BI." }
      ],
      resources: [{ name: "Pandas Getting Started", url: "https://pandas.pydata.org/docs/getting_started/" }, { name: "Matplotlib Tutorials", url: "https://matplotlib.org/stable/tutorials/" }]
    },
    {
      id: "da-phase-4", number: "04", title: "Dashboard, Insights & Portfolio", duration: "4 Weeks",
      relatedSkills: ["Power BI", "Tableau", "Data Visualization", "Communication"],
      description: "Turn analysis into a dashboard and communicate practical recommendations.",
      objectives: ["Build interactive dashboards with clear KPIs.", "Present findings with evidence and concise explanations."],
      tasks: [
        { id: "da-4-1", text: "Build a Power BI or Tableau dashboard from a public dataset." },
        { id: "da-4-2", text: "Write a one-page report with three data-backed insights." },
        { id: "da-4-3", text: "Publish the project notebook, dashboard screenshots and README on GitHub." }
      ],
      resources: [{ name: "Microsoft Learn: Power BI", url: "https://learn.microsoft.com/power-bi/" }, { name: "Kaggle Datasets", url: "https://www.kaggle.com/datasets" }]
    }
  ],
  "Data Scientist": [
    {
      id: "ds-phase-1", number: "01", title: "Python, Mathematics & Statistics", duration: "5-6 Weeks",
      relatedSkills: ["Python", "Statistics", "NumPy", "Mathematics"],
      description: "Develop the programming and mathematical foundation needed for data science.",
      objectives: ["Write Python programs and work with NumPy arrays.", "Understand descriptive statistics, probability and basic linear algebra."],
      tasks: [
        { id: "ds-1-1", text: "Solve 25 Python problems involving lists, dictionaries, functions and files." },
        { id: "ds-1-2", text: "Practice NumPy array operations and basic numerical calculations." },
        { id: "ds-1-3", text: "Explain mean, variance, standard deviation and probability with examples." }
      ],
      resources: [{ name: "Python Tutorial", url: "https://docs.python.org/3/tutorial/" }, { name: "Khan Academy Statistics", url: "https://www.khanacademy.org/math/statistics-probability" }]
    },
    {
      id: "ds-phase-2", number: "02", title: "Data Wrangling & Exploratory Analysis", duration: "4-5 Weeks",
      relatedSkills: ["Pandas", "NumPy", "Data Analysis", "Matplotlib"],
      description: "Prepare real-world datasets and discover patterns before modeling.",
      objectives: ["Clean and transform datasets using Pandas.", "Use visualizations and exploratory data analysis to investigate questions."],
      tasks: [
        { id: "ds-2-1", text: "Choose a public dataset and document its columns and data quality issues." },
        { id: "ds-2-2", text: "Perform cleaning, feature inspection and exploratory analysis in a notebook." },
        { id: "ds-2-3", text: "Present five findings with supporting charts." }
      ],
      resources: [{ name: "Pandas Documentation", url: "https://pandas.pydata.org/docs/" }, { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" }]
    },
    {
      id: "ds-phase-3", number: "03", title: "Machine Learning Fundamentals", duration: "6-8 Weeks",
      relatedSkills: ["Machine Learning", "Scikit-learn", "Statistics", "AI"],
      description: "Understand supervised and unsupervised learning and evaluate models correctly.",
      objectives: ["Learn regression, classification, clustering and train/test split.", "Evaluate models using suitable metrics and avoid data leakage."],
      tasks: [
        { id: "ds-3-1", text: "Train a linear regression model and explain its error metric." },
        { id: "ds-3-2", text: "Build a classification model and compare precision, recall and F1-score." },
        { id: "ds-3-3", text: "Try a clustering algorithm and visualize its groups." }
      ],
      resources: [{ name: "Scikit-learn Tutorials", url: "https://scikit-learn.org/stable/tutorial/" }, { name: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" }]
    },
    {
      id: "ds-phase-4", number: "04", title: "End-to-End Data Science Project", duration: "4-6 Weeks",
      relatedSkills: ["Machine Learning", "Git", "GitHub", "Deployment"],
      description: "Complete a reproducible project from problem definition to model evaluation and presentation.",
      objectives: ["Create a clear data and modeling workflow.", "Document limitations and communicate results responsibly."],
      tasks: [
        { id: "ds-4-1", text: "Define a real-world prediction or classification problem and select a dataset." },
        { id: "ds-4-2", text: "Build a reproducible notebook with preprocessing, baseline and evaluated model." },
        { id: "ds-4-3", text: "Publish the project on GitHub with results, limitations and instructions." }
      ],
      resources: [{ name: "Kaggle", url: "https://www.kaggle.com/" }, { name: "GitHub Skills", url: "https://skills.github.com/" }]
    }
  ],
  "AI ML Engineer": [
    {
      id: "ai-phase-1", number: "01", title: "Python, Mathematics & Programming", duration: "5-6 Weeks",
      relatedSkills: ["Python", "Programming Fundamentals", "Statistics", "NumPy"],
      description: "Build the coding and mathematical base for implementing machine learning systems.",
      objectives: ["Become comfortable with Python, functions, OOP and debugging.", "Understand vectors, matrices, probability and basic statistics."],
      tasks: [
        { id: "ai-1-1", text: "Complete 30 Python practice problems and one small CLI project." },
        { id: "ai-1-2", text: "Practice NumPy arrays, matrix operations and vector calculations." },
        { id: "ai-1-3", text: "Revise probability, distributions, derivatives and basic linear algebra." }
      ],
      resources: [{ name: "Python Tutorial", url: "https://docs.python.org/3/tutorial/" }, { name: "3Blue1Brown: Linear Algebra", url: "https://www.3blue1brown.com/topics/linear-algebra" }]
    },
    {
      id: "ai-phase-2", number: "02", title: "Data Handling & Machine Learning", duration: "6-8 Weeks",
      relatedSkills: ["Pandas", "NumPy", "Machine Learning", "Scikit-learn"],
      description: "Prepare data, train baseline models and understand how to evaluate them.",
      objectives: ["Use Pandas for cleaning and feature preparation.", "Train regression and classification models and evaluate performance."],
      tasks: [
        { id: "ai-2-1", text: "Clean and explore a real dataset using Pandas." },
        { id: "ai-2-2", text: "Train and evaluate one regression and one classification model." },
        { id: "ai-2-3", text: "Compare models and explain overfitting, underfitting and data leakage." }
      ],
      resources: [{ name: "Scikit-learn Getting Started", url: "https://scikit-learn.org/stable/getting_started.html" }, { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" }]
    },
    {
      id: "ai-phase-3", number: "03", title: "Deep Learning & Modern AI", duration: "6-8 Weeks",
      relatedSkills: ["Deep Learning", "TensorFlow", "PyTorch", "NLP"],
      description: "Explore neural networks and choose a beginner-friendly deep learning framework.",
      objectives: ["Understand layers, activation functions, loss and optimization.", "Build a small image or text model and evaluate it."],
      tasks: [
        { id: "ai-3-1", text: "Train a simple neural network on a beginner dataset." },
        { id: "ai-3-2", text: "Complete a basic image or text classification tutorial." },
        { id: "ai-3-3", text: "Record model performance and examples where it makes mistakes." }
      ],
      resources: [{ name: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/" }, { name: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials" }]
    },
    {
      id: "ai-phase-4", number: "04", title: "AI Application & Deployment", duration: "4-6 Weeks",
      relatedSkills: ["FastAPI", "REST API", "Git", "GitHub", "Deployment"],
      description: "Package a model behind an API and create a usable, documented AI application.",
      objectives: ["Load a trained model in an application endpoint.", "Understand input validation, responsible output and deployment basics."],
      tasks: [
        { id: "ai-4-1", text: "Build a small prediction API using FastAPI or Flask." },
        { id: "ai-4-2", text: "Create a simple frontend or interface to use the model." },
        { id: "ai-4-3", text: "Deploy the demo and publish its limitations and setup guide on GitHub." }
      ],
      resources: [{ name: "FastAPI Tutorial", url: "https://fastapi.tiangolo.com/tutorial/" }, { name: "Hugging Face Learn", url: "https://huggingface.co/learn" }]
    }
  ],
  "Cybersecurity": [
    {
      id: "cy-phase-1", number: "01", title: "Computer, Network & Linux Fundamentals", duration: "4-5 Weeks",
      relatedSkills: ["Networking", "Linux", "Operating Systems", "Computer Fundamentals"],
      description: "Understand the systems and networks that security professionals work to protect.",
      objectives: ["Learn IP addresses, DNS, HTTP/HTTPS, ports and basic network flow.", "Use Linux terminal commands, permissions and processes."],
      tasks: [
        { id: "cy-1-1", text: "Practice essential Linux commands and file permissions in a safe lab." },
        { id: "cy-1-2", text: "Draw a simple network diagram and explain DNS, TCP and HTTP." },
        { id: "cy-1-3", text: "Learn OS users, processes, updates and basic system hardening." }
      ],
      resources: [{ name: "Linux Journey", url: "https://linuxjourney.com/" }, { name: "Cisco Networking Basics", url: "https://www.netacad.com/" }]
    },
    {
      id: "cy-phase-2", number: "02", title: "Security Fundamentals & Defensive Practices", duration: "4 Weeks",
      relatedSkills: ["Cybersecurity", "Network Security", "Cryptography"],
      description: "Learn core security principles, common threats and practical defensive habits.",
      objectives: ["Understand confidentiality, integrity, availability and least privilege.", "Recognize phishing, malware, weak authentication and common web risks."],
      tasks: [
        { id: "cy-2-1", text: "Create a threat checklist for a sample student portal." },
        { id: "cy-2-2", text: "Enable MFA and document safe password and account practices." },
        { id: "cy-2-3", text: "Study the OWASP Top 10 and summarize five web application risks." }
      ],
      resources: [{ name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" }, { name: "CISA Secure Our World", url: "https://www.cisa.gov/secure-our-world" }]
    },
    {
      id: "cy-phase-3", number: "03", title: "Practical Security Labs & Monitoring", duration: "5-6 Weeks",
      relatedSkills: ["Wireshark", "Security Tools", "Python", "Networking"],
      description: "Practice security analysis only in authorized learning environments and your own lab.",
      objectives: ["Inspect sample network traffic and identify basic protocol patterns.", "Understand logs, alerts and safe vulnerability assessment."],
      tasks: [
        { id: "cy-3-1", text: "Complete beginner defensive labs on an authorized training platform." },
        { id: "cy-3-2", text: "Use Wireshark to inspect a sample capture file and write observations." },
        { id: "cy-3-3", text: "Write a Python script to parse a sample log file for repeated failed logins." }
      ],
      resources: [{ name: "TryHackMe Learning Paths", url: "https://tryhackme.com/paths" }, { name: "Wireshark User Guide", url: "https://www.wireshark.org/docs/" }]
    },
    {
      id: "cy-phase-4", number: "04", title: "Security Portfolio & Responsible Reporting", duration: "3-4 Weeks",
      relatedSkills: ["Documentation", "Git", "GitHub", "Risk Assessment"],
      description: "Demonstrate security knowledge through safe lab reports and clear documentation.",
      objectives: ["Write concise findings with impact and remediation steps.", "Understand responsible disclosure and legal authorization."],
      tasks: [
        { id: "cy-4-1", text: "Write a report for a deliberately vulnerable training lab, including remediation." },
        { id: "cy-4-2", text: "Create a basic security checklist for a demo web application." },
        { id: "cy-4-3", text: "Publish sanitized lab notes and learning reflections on GitHub." }
      ],
      resources: [{ name: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }, { name: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" }]
    }
  ]
};

function normalizeSkill(value) {
  return String(value || "").toLowerCase().trim().replace(/[._-]/g, " ").replace(/\s+/g, " ");
}

const SKILL_ALIASES = {
  "js": "javascript", "javascript": "javascript", "react js": "react", "react.js": "react",
  "node js": "node", "node.js": "node", "rest apis": "rest api", "apis": "rest api",
  "dsa": "data structures", "html5": "html", "css3": "css", "ml": "machine learning",
  "ai ml": "machine learning", "ai": "machine learning", "postgresql": "sql",
  "mysql": "sql", "problem solving": "algorithms"
};

function canonicalSkill(value) {
  const normalized = normalizeSkill(value);
  return SKILL_ALIASES[normalized] || normalized;
}


function CareerRoadmap({ onBack, targetCareer: propCareer, missingSkills: propMissingSkills }) {
  const [selectedCareer, setSelectedCareer] = useState(propCareer || "Software Developer");
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [completedByCareer, setCompletedByCareer] = useState({});
  const [progressByCareer, setProgressByCareer] = useState({});
  const [missingSkills, setMissingSkills] = useState(propMissingSkills || []);
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedPhases, setExpandedPhases] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // "all", "pending", "completed"

  // Load user profile & saved roadmap progress from Firestore
  useEffect(() => {
    const fetchRoadmapData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.targetCareer && !propCareer) {
            setSelectedCareer(data.targetCareer);
          }
          const savedByCareer = data.roadmapCompletedTasksByCareer && typeof data.roadmapCompletedTasksByCareer === "object"
            ? data.roadmapCompletedTasksByCareer
            : {};
          const legacyCareer = data.targetCareer || propCareer || "Software Developer";
          if (!Array.isArray(savedByCareer[legacyCareer]) && Array.isArray(data.roadmapCompletedTasks)) {
            savedByCareer[legacyCareer] = data.roadmapCompletedTasks;
          }
          setCompletedByCareer(savedByCareer);
          const savedProgress = data.roadmapProgressByCareer && typeof data.roadmapProgressByCareer === "object"
            ? data.roadmapProgressByCareer
            : {};
          setProgressByCareer(savedProgress);
          const activeCareer = propCareer || data.targetCareer || "Software Developer";
          setSelectedCareer(activeCareer);
          setCompletedTaskIds(Array.isArray(savedByCareer[activeCareer]) ? savedByCareer[activeCareer] : []);
          if (data.resumeAnalysis?.missing_skills && !propMissingSkills) {
            setMissingSkills(data.resumeAnalysis.missing_skills);
          }
        }
      } catch (err) {
        console.error("Roadmap fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, [propCareer, propMissingSkills]);

  // Select the roadmap matching the profile career.
  const phases = ROADMAP_TEMPLATES[selectedCareer] || ROADMAP_TEMPLATES["Software Developer"];

  const handleCareerChange = (career) => {
    setSelectedCareer(career);
    setCompletedTaskIds(Array.isArray(completedByCareer[career]) ? completedByCareer[career] : []);
    setFilterMode("all");
    setSaveMessage("");
  };

  // Initialize expanded state for first 2 phases
  useEffect(() => {
    if (phases.length > 0) {
      setExpandedPhases({
        [phases[0].id]: true,
        [phases[1]?.id]: true,
      });
    }
  }, [selectedCareer]);

  // Calculate overall tasks & progress
  const allTasks = phases.flatMap((p) => p.tasks);
  const totalTasksCount = allTasks.length;
  const completedCount = allTasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const progressPercentage = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Toggle Task Completion and sync to Firestore
  const handleToggleTask = async (taskId) => {
    const isCompleted = completedTaskIds.includes(taskId);
    const updated = isCompleted
      ? completedTaskIds.filter((id) => id !== taskId)
      : [...completedTaskIds, taskId];
    const nextByCareer = { ...completedByCareer, [selectedCareer]: updated };

    setCompletedTaskIds(updated);
    setCompletedByCareer(nextByCareer);
    setSaveMessage("");

    const user = auth.currentUser;
    if (user) {
      try {
        setSaving(true);
        const nextProgress = totalTasksCount > 0 ? Math.round((allTasks.filter((task) => updated.includes(task.id)).length / totalTasksCount) * 100) : 0;
        const nextProgressByCareer = { ...progressByCareer, [selectedCareer]: nextProgress };
        setProgressByCareer(nextProgressByCareer);
        await setDoc(
          doc(db, "users", user.uid),
          {
            roadmapCompletedTasksByCareer: nextByCareer,
            roadmapProgressByCareer: nextProgressByCareer,
            roadmapCompletedTasks: updated,
            roadmapProgress: nextProgress,
            roadmapUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setSaveMessage("Progress saved successfully.");
      } catch (err) {
        console.error("Roadmap sync error:", err);
        setSaveMessage("Could not save progress. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleExpand = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Determine if phase addresses a missing skill
  const isPhaseMissingSkillFocus = (phase) => {
    if (!missingSkills?.length) return false;
    const missingSet = new Set(missingSkills.map(canonicalSkill));
    return phase.relatedSkills.some((skill) => {
      const canonical = canonicalSkill(skill);
      return missingSet.has(canonical) || [...missingSet].some((missing) =>
        missing && canonical && (missing.includes(canonical) || canonical.includes(missing))
      );
    });
  };

  // Check if phase is fully completed
  const isPhaseFullyCompleted = (phase) => {
    return phase.tasks.every((t) => completedTaskIds.includes(t.id));
  };

  // Filter phases
  const filteredPhases = phases.filter((phase) => {
    const fullyDone = isPhaseFullyCompleted(phase);
    if (filterMode === "completed") return fullyDone;
    if (filterMode === "pending") return !fullyDone;
    return true;
  });

  return (
    <div className="roadmap-page">
      {/* Header */}
      <header className="roadmap-header-area">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
              🗺️ Personalized Career Roadmap
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Step-by-step sequential learning phases prioritized to address your identified skill gaps.
            </p>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
              ROADMAP TRACK:
            </label>
            <select
              value={selectedCareer}
              onChange={(e) => handleCareerChange(e.target.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "white",
                fontWeight: "700",
                fontSize: "13px",
                color: "#1e293b",
                cursor: "pointer",
              }}
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Web Developer">Web Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI ML Engineer">AI ML Engineer</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Roadmap Content */}
      <main className="roadmap-content">
        {/* Hero Progress Banner */}
        <section className="roadmap-progress-banner">
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "1px", color: "#c7d2fe", fontWeight: "800", textTransform: "uppercase" }}>
              {selectedCareer.toUpperCase()} JOURNEY
            </span>
            <h2>Roadmap Progress: {progressPercentage}%</h2>
            <p>
              Completed <strong>{completedCount} of {totalTasksCount}</strong> practical milestone tasks.
              Phases highlighted with <strong>"Priority Focus"</strong> address the specific skill gaps discovered in your resume.
            </p>
            {loading && <small style={{ color: "#c7d2fe", display: "block" }}>Loading your saved roadmap...</small>}
            {saving && <small style={{ color: "#a5b4fc", display: "block" }}>Saving progress to cloud...</small>}
            {!saving && saveMessage && <small role="status" style={{ color: saveMessage.startsWith("Could not") ? "#fecaca" : "#bbf7d0", display: "block" }}>{saveMessage}</small>}
          </div>

          <div className="banner-progress-circle">
            <strong>{progressPercentage}%</strong>
            <small>Completed</small>
          </div>
        </section>

        {/* Filter Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setFilterMode("all")}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: filterMode === "all" ? "#4f46e5" : "white",
                color: filterMode === "all" ? "white" : "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              All Phases ({phases.length})
            </button>
            <button
              onClick={() => setFilterMode("pending")}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: filterMode === "pending" ? "#4f46e5" : "white",
                color: filterMode === "pending" ? "white" : "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              In Progress / Pending
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: filterMode === "completed" ? "#4f46e5" : "white",
                color: filterMode === "completed" ? "white" : "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              Completed
            </button>
          </div>

          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {completedCount}/{totalTasksCount} Tasks Completed
          </span>
        </div>

        {/* Phases Accordion List */}
        <div className="phases-container">
          {filteredPhases.map((phase) => {
            const isMissingFocus = isPhaseMissingSkillFocus(phase);
            const isDone = isPhaseFullyCompleted(phase);
            const isOpen = Boolean(expandedPhases[phase.id]);
            const phaseTasksDone = phase.tasks.filter((t) => completedTaskIds.includes(t.id)).length;

            return (
              <div
                key={phase.id}
                className={`phase-card ${isMissingFocus ? "priority-focus" : ""} ${isDone ? "all-completed" : ""}`}
              >
                {/* Header */}
                <div className="phase-card-header" onClick={() => toggleExpand(phase.id)}>
                  <div className="phase-title-group">
                    <div className={`phase-number-badge ${isDone ? "completed" : ""}`}>
                      {isDone ? "✓" : phase.number}
                    </div>

                    <div className="phase-title-text">
                      <h3>{phase.title}</h3>
                      <div className="phase-tags">
                        <span className="phase-duration">⏱️ {phase.duration}</span>
                        {isMissingFocus && (
                          <span className="focus-tag">★ Priority: Missing Skill Focus</span>
                        )}
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          • {phaseTasksDone}/{phase.tasks.length} tasks
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {isDone && (
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>
                        Completed
                      </span>
                    )}
                    <span style={{ fontSize: "16px", color: "#94a3b8" }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Collapsible Body */}
                {isOpen && (
                  <div className="phase-card-body">
                    <p className="phase-desc">{phase.description}</p>

                    {/* Learning Objectives */}
                    <div className="objectives-box">
                      <h4>Learning Objectives</h4>
                      <ul>
                        {phase.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Practical Tasks Checkbox List */}
                    <div className="tasks-box">
                      <h4>Practical Action Tasks:</h4>
                      {phase.tasks.map((task) => {
                        const checked = completedTaskIds.includes(task.id);
                        return (
                          <label
                            key={task.id}
                            className={`task-item ${checked ? "done" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleTask(task.id)}
                            />
                            <span className="task-label">{task.text}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Curated Resources */}
                    {phase.resources?.length > 0 && (
                      <div className="resources-box">
                        <h4>Recommended Free Learning Resources:</h4>
                        <div className="resources-links">
                          {phase.resources.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="resource-link"
                            >
                              🔗 {res.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default CareerRoadmap;
