package com.unimarket.backend.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// captura exceções lançadas nos controllers e retorna respostas padronizadas
@RestControllerAdvice
public class GlobalExceptionHandler {

    // preserva status HTTP definido pelo service/controller
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of("erro", ex.getReason()));
    }

    // captura RuntimeException e retorna 400 com a mensagem de erro
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", ex.getMessage())); // retorna a mensagem definida no service
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage() == null ? "Dados invalidos" : error.getDefaultMessage())
                .orElse("Dados invalidos");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", message));
    }
}
