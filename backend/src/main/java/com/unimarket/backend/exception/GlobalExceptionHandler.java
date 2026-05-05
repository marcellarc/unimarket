package com.unimarket.backend.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// captura exceções lançadas nos controllers e retorna respostas padronizadas
@RestControllerAdvice
public class GlobalExceptionHandler {

    // captura RuntimeException e retorna 400 com a mensagem de erro
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", ex.getMessage())); // retorna a mensagem definida no service
    }
}