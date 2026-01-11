package Backend.model;
// Simple POJO
public class AuthRequest {
    private String email;
    private String password;
    // Generate Getters & Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}