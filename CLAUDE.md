# CLAUDE.md

## Project Overview

**Grile Licență 2026** — A Java Spring Boot web app that reads exam questions from an Excel file (`Grile_Licenta_2026.xlsx`), presents them in a randomized quiz format, and provides AI-powered explanations for each answer using the Claude API.

## Development Commands

```bash
# Build the project
mvn clean package

# Run the app (available at http://localhost:8080)
mvn spring-boot:run

# Run tests
mvn test
```

Requires Java 17+ and Maven 3.8+.

## Architecture

### Backend (Spring Boot)
- **ExcelParserService** — parses `Grile_Licenta_2026.xlsx` on startup, extracts questions + correct answers, stores in memory
- **AiExplanationService** — calls Anthropic Claude API to explain why answers are correct/incorrect. Falls back to basic explanation if no API key is configured
- **QuizController** — REST API: `GET /api/question/random`, `POST /api/answer`, `GET /api/topics`, `GET /api/stats`
- **Question** model — id, tematica, number, questionText, options, correctAnswers, needsVisualization

### Frontend (static HTML/JS/CSS)
- Single page app at `src/main/resources/static/`
- Vanilla JS with fetch API — no frameworks
- Topic filter, randomized questions, answer checking with AI explanations

### Configuration
- `application.properties` — excel file path, server port, Anthropic API key
- Set `anthropic.api.key=sk-ant-...` to enable AI explanations

## Excel Structure
The Excel has columns: Tematica, Nr, Intrebare, Variante, Raspuns Corect, Necesita vizualizare.
Correct answers are in separate rows after each question block (Variante is empty, Intrebare contains answers like "(a),(d)").
