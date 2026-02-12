package Backend.controller;

import Backend.exception.UserNotFoundException;
import Backend.model.AuthRequest;
import Backend.model.UpdateUserRequest;
import Backend.model.UserModel;
import Backend.repository.UserRepository;
import Backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // New Import
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@SuppressWarnings("unused")
@RestController

public class UserController {
    @Autowired
    private UserRepository userRepository;

    // Inject the PasswordEncoder bean created in SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    private final String UPLOAD_DIR = "uploads/";

    // --- 1. Registration (Secure Hashing Implemented) ---
    @PostMapping("/register")
    public ResponseEntity<?> newUserModel(@RequestBody UserModel newUserModel){

        // Check if email already exists
        if (userRepository.findByEmail(newUserModel.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        // 1. HASH the plain-text password before saving
        String hashedPassword = passwordEncoder.encode(newUserModel.getPassword());
        newUserModel.setPassword(hashedPassword);

        UserModel savedUser = userRepository.save(newUserModel);
        return ResponseEntity.ok(savedUser);
    }

    // --- 2. Login (Secure Comparison Implemented) ---
    @PostMapping ("/login")
    public Map<String, String> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        if (authentication.isAuthenticated()) {
            // Generate Token
            String token = jwtService.generateToken(authRequest.getEmail());
            // Get User ID to return as well
            UserModel user = userRepository.findByEmail(authRequest.getEmail()).get();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login Successful");
            response.put("token", token);
            response.put("id", String.valueOf(user.getId()));
            response.put("role", user.getType());
            response.put("firstname", user.getFirstname());
            return response;
        } else {
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }

    // --- 3. User Image Upload ---
    @PostMapping("/user/userImg")
    public String userImage (@RequestParam("file") MultipartFile file){
        String folder = "uploads/";
        String userImage = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        try {
            File uploadDir = new File(folder);
            if(!uploadDir.exists()){
                uploadDir.mkdirs();
            }
            // Save file with unique name to prevent conflicts
            file.transferTo(Paths.get(folder + userImage));
        } catch (IOException e){
            e.printStackTrace();
            return "Error uploading file: "+ e.getMessage();
        }
        return userImage;
    }

    // --- 4. Get User Image ---
    @GetMapping("/user/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getUserImage(@PathVariable String filename){

        // Use Paths.get() to safely combine the directory and filename
        java.nio.file.Path filePath = Paths.get(UPLOAD_DIR, filename);

        File file = filePath.toFile(); // Convert the Path object back to a File object for FileSystemResource

        if (!file.exists()){
            return ResponseEntity.notFound().build();
        }

        // FileSystemResource still accepts a File object
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    @GetMapping("/users")
    List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or authentication.principal.id == #id")
    UserModel getUser(@PathVariable Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @PutMapping("/user/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or authentication.principal.id == #id")
    UserModel updateUser(@RequestBody UpdateUserRequest request, @PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    // Update basic fields
                    user.setUserid(request.getUserid());
                    user.setFirstname(request.getFirstname());
                    user.setLastname(request.getLastname());
                    user.setPhone(request.getPhone());
                    user.setAddress(request.getAddress());
                    
                    // Update user image if provided
                    if (request.getUserimg() != null && !request.getUserimg().isEmpty()) {
                        user.setUserimg(request.getUserimg());
                    }

                    // Handle email update with uniqueness check
                    if (!user.getEmail().equals(request.getEmail())) {
                        Optional<UserModel> existingUser = userRepository.findByEmail(request.getEmail());
                        if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                            throw new RuntimeException("Email is already in use");
                        }
                        user.setEmail(request.getEmail());
                    }

                    // Handle password update
                    if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                        if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
                            throw new RuntimeException("Current password is required to change password");
                        }
                        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                            throw new RuntimeException("Current password is incorrect");
                        }
                        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                            throw new RuntimeException("New password and confirmation do not match");
                        }
                        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    }

                    return userRepository.save(user);
                })
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @DeleteMapping("/user/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or authentication.principal.id == #id")
    void deleteUser(@PathVariable Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        userRepository.deleteById(id);
    }
}