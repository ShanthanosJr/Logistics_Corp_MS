package Backend.config;

import Backend.model.UserModel;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
public class UserInfoUserDetails implements UserDetails {

    private String name;
    private String password;
    private List<GrantedAuthority> authorities;
    private Long id;

    public UserInfoUserDetails(UserModel userInfo) {
        name = userInfo.getEmail(); // We use Email as the "Username" for login
        password = userInfo.getPassword();
        // Handle user type/role - default to "USER" if not set
        String userType = userInfo.getType();
        if (userType == null || userType.trim().isEmpty()) {
            userType = "USER"; // Default role
        }
        authorities = Arrays.asList(new SimpleGrantedAuthority(userType.toUpperCase()));
        this.id = userInfo.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override
    public String getPassword() { return password; }
    @Override
    public String getUsername() { return name; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }

    public Long getId() { return id; }
}