package com.grile.licenta.controller;

import com.grile.licenta.model.Question;
import com.grile.licenta.service.AiExplanationService;
import com.grile.licenta.service.ExcelParserService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final ExcelParserService excelParser;
    private final AiExplanationService aiService;

    public QuizController(ExcelParserService excelParser, AiExplanationService aiService) {
        this.excelParser = excelParser;
        this.aiService = aiService;
    }

    @GetMapping("/topics")
    public List<String> getTopics() {
        return excelParser.getTematicas();
    }

    @GetMapping("/question/random")
    public Map<String, Object> getRandomQuestion(@RequestParam(required = false) String topic) {
        Question q = excelParser.getRandomQuestion(topic);
        if (q == null) {
            return Map.of("error", "Nu s-au găsit întrebări");
        }
        // Return question WITHOUT correct answers
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", q.getId());
        result.put("tematica", q.getTematica());
        result.put("number", q.getNumber());
        result.put("questionText", q.getQuestionText());
        result.put("options", q.getOptions());
        result.put("needsVisualization", q.isNeedsVisualization());
        result.put("multipleCorrect", q.getCorrectAnswers().size() > 1);
        return result;
    }

    @PostMapping("/answer")
    public Map<String, Object> checkAnswer(@RequestBody AnswerRequest request) {
        Question q = excelParser.getQuestionById(request.questionId());
        if (q == null) {
            return Map.of("error", "Întrebarea nu a fost găsită");
        }

        List<String> selected = request.selectedAnswers() != null
                ? request.selectedAnswers() : List.of();
        List<String> correct = q.getCorrectAnswers();

        boolean isCorrect = new HashSet<>(correct).equals(new HashSet<>(selected));

        String explanation = aiService.explain(q, selected);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("correct", isCorrect);
        result.put("correctAnswers", correct);
        result.put("selectedAnswers", selected);
        result.put("explanation", explanation);
        result.put("aiEnabled", aiService.isAiEnabled());
        return result;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalQuestions", excelParser.getAllQuestions().size());
        stats.put("topics", excelParser.getTematicas());
        stats.put("aiEnabled", aiService.isAiEnabled());
        return stats;
    }

    public record AnswerRequest(int questionId, List<String> selectedAnswers) {}
}
