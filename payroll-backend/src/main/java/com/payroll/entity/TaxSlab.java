package com.payroll.entity;

import com.payroll.enums.TaxRegime;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tax_slabs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxSlab extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime", nullable = false)
    private TaxRegime regime;

    @Column(name = "financial_year", nullable = false, length = 10)
    private String financialYear;

    @Column(name = "min_income", nullable = false, precision = 14, scale = 2)
    private BigDecimal minIncome;

    @Column(name = "max_income", precision = 14, scale = 2)
    private BigDecimal maxIncome;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "surcharge_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal surchargeRate = BigDecimal.ZERO;
}
