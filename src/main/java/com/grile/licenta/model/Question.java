package com.grile.licenta.model;

import java.util.List;

public class Question {

    private int id;
    private String tematica;
    private int number;
    private String questionText;
    private List<String> options;
    private List<String> correctAnswers;
    private boolean needsVisualization;

    public Question() {}

    public Question(int id, String tematica, int number, String questionText,
                    List<String> options, List<String> correctAnswers, boolean needsVisualization) {
        this.id = id;
        this.tematica = tematica;
        this.number = number;
        this.questionText = questionText;
        this.options = options;
        this.correctAnswers = correctAnswers;
        this.needsVisualization = needsVisualization;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTematica() { return tematica; }
    public void setTematica(String tematica) { this.tematica = tematica; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public List<String> getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(List<String> correctAnswers) { this.correctAnswers = correctAnswers; }

    public boolean isNeedsVisualization() { return needsVisualization; }
    public void setNeedsVisualization(boolean needsVisualization) { this.needsVisualization = needsVisualization; }
}
