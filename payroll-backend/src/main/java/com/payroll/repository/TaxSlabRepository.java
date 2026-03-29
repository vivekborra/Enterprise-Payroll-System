package com.payroll.repository;

import com.payroll.entity.TaxSlab;
import com.payroll.enums.TaxRegime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlab, UUID> {
    List<TaxSlab> findByRegimeAndFinancialYearOrderByMinIncomeAsc(TaxRegime regime, String financialYear);
    boolean existsByRegimeAndFinancialYear(TaxRegime regime, String financialYear);
}
