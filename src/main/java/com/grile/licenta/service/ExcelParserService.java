package com.grile.licenta.service;

import com.grile.licenta.model.Question;
import jakarta.annotation.PostConstruct;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExcelParserService {

    @Value("${excel.file.path}")
    private String excelFilePath;

    private final List<Question> questions = new ArrayList<>();
    private final List<String> tematicas = new ArrayList<>();

    @PostConstruct
    public void init() throws IOException {
        parseExcel();
    }

    public List<Question> getAllQuestions() {
        return Collections.unmodifiableList(questions);
    }

    public List<String> getTematicas() {
        return Collections.unmodifiableList(tematicas);
    }

    public Question getQuestionById(int id) {
        return questions.stream()
                .filter(q -> q.getId() == id)
                .findFirst()
                .orElse(null);
    }

    public Question getRandomQuestion(String tematica) {
        List<Question> pool = questions;
        if (tematica != null && !tematica.isEmpty()) {
            pool = questions.stream()
                    .filter(q -> q.getTematica().equals(tematica))
                    .toList();
        }
        if (pool.isEmpty()) return null;
        return pool.get(new Random().nextInt(pool.size()));
    }

    private void parseExcel() throws IOException {
        try (FileInputStream fis = new FileInputStream(excelFilePath);
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<RawRow> rawRows = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String tematica = getCellString(row, 0);
                String nrStr = getCellString(row, 1);
                String intrebare = getCellString(row, 2);
                String variante = getCellString(row, 3);
                String vizualizare = getCellString(row, 5);

                if (tematica == null || tematica.isEmpty()) continue;

                int nr;
                try {
                    nr = (int) Double.parseDouble(nrStr);
                } catch (Exception e) {
                    continue;
                }

                rawRows.add(new RawRow(tematica, nr, intrebare, variante, vizualizare));
            }

            // Separate into question rows and answer rows, then match
            List<QuestionBlock> blocks = groupIntoBlocks(rawRows);

            int globalId = 1;
            Set<String> tematicaSet = new LinkedHashSet<>();

            for (QuestionBlock block : blocks) {
                for (Map.Entry<Integer, RawRow> entry : block.questions.entrySet()) {
                    int nr = entry.getKey();
                    RawRow qRow = entry.getValue();
                    RawRow aRow = block.answers.get(nr);

                    List<String> options = parseOptions(qRow.variante);
                    if (options.isEmpty()) continue;

                    List<String> correctAnswers = new ArrayList<>();
                    if (aRow != null) {
                        correctAnswers = parseCorrectAnswers(aRow.intrebare);
                    }

                    boolean needsViz = qRow.vizualizare != null &&
                            (qRow.vizualizare.contains("Imagine") || qRow.vizualizare.contains("Cod"));

                    Question q = new Question(
                            globalId++,
                            qRow.tematica.trim(),
                            nr,
                            cleanQuestionText(qRow.intrebare),
                            options,
                            correctAnswers,
                            needsViz
                    );
                    questions.add(q);
                    tematicaSet.add(qRow.tematica.trim());
                }
            }

            tematicas.addAll(tematicaSet);
            System.out.println("Parsed " + questions.size() + " questions from " + tematicas.size() + " topics");
        }
    }

    private List<QuestionBlock> groupIntoBlocks(List<RawRow> rows) {
        List<QuestionBlock> blocks = new ArrayList<>();
        QuestionBlock current = new QuestionBlock();
        boolean inAnswers = false;

        for (RawRow row : rows) {
            boolean isAnswerRow = (row.variante == null || row.variante.isEmpty())
                    && row.intrebare != null
                    && row.intrebare.trim().matches("^\\([a-z]\\).*");

            if (isAnswerRow) {
                current.answers.put(row.nr, row);
                inAnswers = true;
            } else if (row.variante != null && !row.variante.isEmpty()) {
                if (inAnswers) {
                    // Transitioning from answers back to questions — new block
                    blocks.add(current);
                    current = new QuestionBlock();
                    inAnswers = false;
                }
                current.questions.put(row.nr, row);
            }
        }

        if (!current.questions.isEmpty() || !current.answers.isEmpty()) {
            blocks.add(current);
        }

        return blocks;
    }

    private List<String> parseOptions(String variante) {
        if (variante == null || variante.isEmpty()) return List.of();

        List<String> options = new ArrayList<>();
        // Split by option pattern: (a), (b), etc.
        Pattern p = Pattern.compile("\\(([a-z])\\)\\s*");
        Matcher m = p.matcher(variante);

        List<int[]> positions = new ArrayList<>();
        while (m.find()) {
            positions.add(new int[]{m.start(), m.end(), m.group(1).charAt(0)});
        }

        for (int i = 0; i < positions.size(); i++) {
            int start = positions.get(i)[0];
            int end = (i + 1 < positions.size()) ? positions.get(i + 1)[0] : variante.length();
            String optionText = variante.substring(start, end).trim();
            // Remove trailing newlines
            optionText = optionText.replaceAll("\\s+$", "");
            if (!optionText.isEmpty()) {
                options.add(optionText);
            }
        }

        return options;
    }

    private List<String> parseCorrectAnswers(String answerText) {
        if (answerText == null) return List.of();
        List<String> answers = new ArrayList<>();
        Pattern p = Pattern.compile("\\(([a-z])\\)");
        Matcher m = p.matcher(answerText);
        while (m.find()) {
            answers.add(m.group(1));
        }
        return answers;
    }

    private String cleanQuestionText(String text) {
        if (text == null) return "";
        // Remove page numbers and header artifacts
        text = text.replaceAll("\\d+\\s*\\n\\s*STRUCTURI DISCRETE.*?\\n?", "\n");
        text = text.replaceAll("\\d+\\s*\\n\\s*LIMBAJE DE PROGRAMARE.*?\\n?", "\n");
        text = text.replaceAll("\\d+\\s*\\n\\s*LIMBAJE FORMALE.*?\\n?", "\n");
        text = text.replaceAll("\\d+\\s*\\n\\s*SISTEME DE CALCUL.*?\\n?", "\n");
        text = text.replaceAll("\\d+\\s*\\n\\s*BAZE DE DATE.*?\\n?", "\n");
        text = text.replaceAll("\\d+\\s*\\n\\s*RET.*?ELE DE CALCULATOARE.*?\\n?", "\n");
        text = text.replaceAll("Teoria grafurilor.*?combinatorică\\s*", "");
        // Trim multiple newlines
        text = text.replaceAll("\\n{3,}", "\n\n");
        return text.trim();
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private static class RawRow {
        String tematica;
        int nr;
        String intrebare;
        String variante;
        String vizualizare;

        RawRow(String tematica, int nr, String intrebare, String variante, String vizualizare) {
            this.tematica = tematica;
            this.nr = nr;
            this.intrebare = intrebare;
            this.variante = variante;
            this.vizualizare = vizualizare;
        }
    }

    private static class QuestionBlock {
        LinkedHashMap<Integer, RawRow> questions = new LinkedHashMap<>();
        Map<Integer, RawRow> answers = new HashMap<>();
    }
}
