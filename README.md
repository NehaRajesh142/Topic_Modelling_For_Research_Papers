# ResearchScope

**Research paper topic modeling workbench built with Flask and a pure-Python LDA.**

ResearchScope finds the hidden themes in a collection of research papers. It reads paper titles and abstracts, groups them into topics using Latent Dirichlet Allocation (LDA), gives each topic a readable name, and shows how those themes change across publication years. You can grow the dataset by adding papers by hand or by importing them from Crossref, and export everything to Excel.

---

## Features

| Section | What it does |
|---|---|
| **01 · Topic Discovery** | Runs LDA with 2–8 topics (slider). Shows each topic's top 10 keywords, an auto-generated topic name and a bar chart of papers per topic. |
| **02 · Topic Quality** | Scores every topic with a coherence-style metric (0–100) and labels it *Strong*, *Moderate* or *Needs tuning*. Shows an overall model score. |
| **03 · Topic × Year** | Heatmap of how many papers fall into each topic per publication year. |
| **04 · Model Comparison** | Trains models with 2 to 8 topics, plots their quality scores and suggests the best topic count. |
| **05 · Web Research Import** | Searches the Crossref API by title, author, DOI or topic and adds a result to the dataset in one click. Duplicate DOIs are rejected. |
| **06 · Dataset** | Form to add a paper manually, plus a formatted Excel (.xlsx) export of the current dataset. |
| **07 · Paper Explorer** | Lists the papers in the selected topic with year and assignment confidence. |

---

## Tech Stack

- **Backend:** Python 3, Flask
- **Topic model:** LDA with collapsed Gibbs sampling, written from scratch (no scikit-learn or gensim)
- **Frontend:** HTML, CSS, vanilla JavaScript, Chart.js
- **Data source:** Crossref REST API
- **Storage:** CSV file (`research_papers.csv`)
- **Export:** openpyxl

---

## Project Structure

```
ResearchScope/
├── app.py                 # Flask app, LDA model, quality scoring, API routes
├── research_papers.csv    # Dataset used by the model (20 sample papers)
├── requirements.txt       # Flask, openpyxl
├── templates/
│   └── index.html         # Main page
└── static/
    ├── script.js          # Fetches model output, renders charts and tables
    └── style.css          # Dark theme styling
```

> Flask expects `index.html` inside `templates/` and `script.js` / `style.css` inside `static/`.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ResearchScope.git
cd ResearchScope
```

### 2. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 3. Run the app

```bash
python app.py
```

Open **http://127.0.0.1:5000** in your browser. The model runs automatically when the page loads.

An internet connection is needed for the Crossref search and for loading Chart.js from its CDN.

---

## How It Works

### 1. Preprocessing
Each paper's title and abstract are joined, lowercased and split into words of 3+ letters. Common English words and generic research words (*paper, study, method, results, proposed…*) are removed as stopwords.

### 2. LDA topic modeling
The model uses collapsed Gibbs sampling:
- Every word is randomly assigned to one of *k* topics.
- For 100 iterations, each word is reassigned with probability proportional to

  `(papers' use of topic t + α) × (topic t's use of the word + β) / (topic t size + V·β)`

  with α = 0.5, β = 0.1 and a fixed random seed (42) so results are reproducible.
- Each paper is assigned to its most frequent topic, and that share is reported as its **confidence**.

### 3. Topic naming
The top 10 keywords of each topic are matched against keyword sets for ten research areas (Computer Vision, NLP, Cybersecurity, Healthcare AI, Renewable Energy, Autonomous Vehicles, Cloud & IoT, Big Data & Smart Cities, Blockchain, Machine Learning). The area with the most overlap becomes the topic name.

### 4. Quality score
For every pair of top keywords, the score measures how often they appear in the same paper (a UMass-style coherence):

`log((papers with both words + 1) / (papers with the first word + 1))`

The average is scaled to 0–100. Higher means the keywords belong together more strongly.

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Main page |
| `GET` | `/api/model?topics=k` | Runs LDA with *k* topics (2–8) and returns topics, names, counts, quality scores, heatmap data and paper assignments |
| `POST` | `/api/add` | Adds a paper manually. Requires `title`, `abstract` and `year` |
| `GET` | `/api/search-web?q=...` | Searches Crossref and returns up to 8 papers |
| `POST` | `/api/add-web` | Adds a Crossref result to the dataset (rejects duplicate DOIs) |
| `GET` | `/download/excel` | Downloads the dataset as a formatted `.xlsx` file |

---

## Dataset Format

`research_papers.csv` uses these columns:

| Column | Required | Example |
|---|---|---|
| `title` | Yes | Network Intrusion Detection Using Machine Learning |
| `abstract` | Yes | Machine learning methods can detect network attacks… |
| `year` | Yes | 2023 |
| `author` | No | |
| `source` | No | Original CSV / Crossref / Manual entry |
| `doi` | No | 10.1000/xyz123 |

---

## Sample Output (5 topics, 20 papers)

| Topic | Name | Papers | Quality |
|---|---|---|---|
| 1 | Computer Vision & Image Processing | 5 | 24.2 |
| 2 | Machine Learning & Prediction | 5 | 17.7 |
| 3 | Cybersecurity & Network Security | 4 | 17.7 |
| 4 | Cloud Computing & IoT | 2 | 25.2 |
| 5 | Healthcare & Medical AI | 4 | 20.6 |

Overall quality: **21.1**. In the 2–8 comparison, 7 topics scores highest (23.0).

---

## Limitations

- With only 20 short abstracts, topics overlap and quality scores stay low. Importing more papers gives cleaner topics.
- Topic names come from fixed keyword rules, so a topic outside the ten areas falls back to a general label.
- Some Crossref records have no abstract. These papers are saved with a placeholder text and add little to the model.
- The dataset is a single CSV file, so it is not meant for many users editing at once.

## Future Scope

- Use TF-IDF filtering or bigrams to improve topic quality
- Add other models such as NMF or BERTopic for comparison
- Import from arXiv and Semantic Scholar
- Move storage to SQLite

---

## Author

**Neha Rajesh**
IV Year B.E. CSE, Rajalakshmi Institute of Technology
Academic NLP mini project
