package com.payroll.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Enterprise Payroll & Tax Processing System API",
        version = "1.0.0",
        description = "Complete payroll management system with Indian tax calculation (Old & New Regime), " +
                      "leave management, and HR analytics",
        contact = @Contact(name = "Payroll Support", email = "support@payroll.com"),
        license = @License(name = "Private", url = "https://payroll.com")
    ),
    servers = {
        @Server(url = "http://localhost:8080/api/v1", description = "Local Development"),
        @Server(url = "https://api.payroll.com/api/v1", description = "Production")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer",
    in = SecuritySchemeIn.HEADER
)
public class SwaggerConfig {
}
