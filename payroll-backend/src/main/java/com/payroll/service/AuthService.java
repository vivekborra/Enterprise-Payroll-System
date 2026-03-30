package com.payroll.service;

import com.payroll.dto.request.LoginRequest;
import com.payroll.dto.response.AuthResponse;
import com.payroll.entity.Employee;
import com.payroll.entity.User;
import com.payroll.exception.BusinessException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.UserRepository;
import com.payroll.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.payroll.dto.request.SignupRequest;
import com.payroll.enums.Role;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId().toString());

        String accessToken = jwtTokenProvider.generateToken(user.getEmail(), claims);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        Optional<Employee> employee = employeeRepository.findByUserId(user.getId());
        auditService.log(user, "LOGIN", "User", user.getId().toString(), "User logged in", null, null);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs() / 1000)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .hasEmployeeProfile(employee.isPresent())
                .employeeCode(employee.map(Employee::getEmployeeCode).orElse(null))
                .employeeId(employee.map(Employee::getId).orElse(null))
                .build();
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .active(true)
                .build();

        user = userRepository.save(user);

        // Create a default employee profile so the user can access the dashboard immediately
        employeeService.createDefaultEmployee(user);

        auditService.log(user, "SIGNUP", "User", user.getId().toString(), "New user registered", null, null);

        // Auto-login after signup
        LoginRequest loginRequest = new LoginRequest(request.getEmail(), request.getPassword());
        return login(loginRequest);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
            auditService.log(user, "LOGOUT", "User", user.getId().toString(), "User logged out", null, null);
        });
    }
}
