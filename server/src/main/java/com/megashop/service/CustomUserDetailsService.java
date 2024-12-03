package com.megashop.service;

import com.megashop.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        logger.info("Attempting to load user by username: " + username);

        // Get raw user data from repository
        var dbUser = userRepository.findByUsername(username);
        if (dbUser == null) {
            logger.warn("User not found: {}", username);
            throw new UsernameNotFoundException("User not found");
        }

        logger.info("User found: {}", username);
        // Map database fields to Spring Security UserDetails
        return User.builder()
                .username(dbUser.getUsername())
                .password(dbUser.getPassword())
                .roles(dbUser.getRole().replace("ROLE_", ""))
                .build();
    }
}