package com.unimarket.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class UnimarketApplication {

	public static void main(String[] args) {
		SpringApplication.run(UnimarketApplication.class, args);
	}

}
