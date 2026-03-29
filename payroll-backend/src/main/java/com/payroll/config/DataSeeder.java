package com.payroll.config;

import com.payroll.entity.User;
import com.payroll.entity.TaxSlab;
import com.payroll.enums.Role;
import com.payroll.enums.TaxRegime;
import com.payroll.repository.TaxSlabRepository;
import com.payroll.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TaxSlabRepository taxSlabRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedTaxSlabs();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@payroll.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@payroll.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@payroll.com / Admin@123");
        }

        if (!userRepository.existsByEmail("hr@payroll.com")) {
            User hr = User.builder()
                    .name("HR Manager")
                    .email("hr@payroll.com")
                    .password(passwordEncoder.encode("Hr@12345"))
                    .role(Role.HR)
                    .active(true)
                    .build();
            userRepository.save(hr);
            log.info("Default HR user created: hr@payroll.com / Hr@12345");
        }
    }

    private void seedTaxSlabs() {
        String fy = "2024-25";
        if (!taxSlabRepository.existsByRegimeAndFinancialYear(TaxRegime.NEW, fy)) {
            // New Regime Slabs FY 2024-25
            taxSlabRepository.saveAll(java.util.List.of(
                TaxSlab.builder().regime(TaxRegime.NEW).financialYear(fy).minIncome(BigDecimal.ZERO).maxIncome(new BigDecimal("300000")).taxRate(BigDecimal.ZERO).build(),
                TaxSlab.builder().regime(TaxRegime.NEW).financialYear(fy).minIncome(new BigDecimal("300001")).maxIncome(new BigDecimal("700000")).taxRate(new BigDecimal("5")).build(),
                TaxSlab.builder().regime(TaxRegime.NEW).financialYear(fy).minIncome(new BigDecimal("700001")).maxIncome(new BigDecimal("1000000")).taxRate(new BigDecimal("10")).build(),
                TaxSlab.builder().regime(TaxRegime.NEW).financialYear(fy).minIncome(new BigDecimal("1000001")).maxIncome(new BigDecimal("1200000")).taxRate(new BigDecimal("15")).build(),
                TaxSlab.builder().regime(TaxRegime.NEW).financialYear(fy).minIncome(new BigDecimal("1200001")).maxIncome(new BigDecimal("1500000")).taxRate(new BigDecimal("20")).build(),
                TaxSlab.builder().regime(TaxRegime.NEW).financialYear(fy).minIncome(new BigDecimal("1500001")).maxIncome(null).taxRate(new BigDecimal("30")).build()
            ));
        }

        if (!taxSlabRepository.existsByRegimeAndFinancialYear(TaxRegime.OLD, fy)) {
            // Old Regime Slabs FY 2024-25
            taxSlabRepository.saveAll(java.util.List.of(
                TaxSlab.builder().regime(TaxRegime.OLD).financialYear(fy).minIncome(BigDecimal.ZERO).maxIncome(new BigDecimal("250000")).taxRate(BigDecimal.ZERO).build(),
                TaxSlab.builder().regime(TaxRegime.OLD).financialYear(fy).minIncome(new BigDecimal("250001")).maxIncome(new BigDecimal("500000")).taxRate(new BigDecimal("5")).build(),
                TaxSlab.builder().regime(TaxRegime.OLD).financialYear(fy).minIncome(new BigDecimal("500001")).maxIncome(new BigDecimal("1000000")).taxRate(new BigDecimal("20")).build(),
                TaxSlab.builder().regime(TaxRegime.OLD).financialYear(fy).minIncome(new BigDecimal("1000001")).maxIncome(null).taxRate(new BigDecimal("30")).build()
            ));
        }
        log.info("Tax slabs seeded for FY {}", fy);
    }
}
