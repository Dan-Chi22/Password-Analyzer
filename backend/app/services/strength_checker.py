from zxcvbn import zxcvbn
import re

class PasswordStrengthChecker:
    def analyze(self, password):
        """Analyze password strength using zxcvbn and custom checks"""
        
        # Use zxcvbn library for strength score
        result = zxcvbn(password)
        
        # Additional security checks
        checks = {
            'length': len(password) >= 12,
            'uppercase': bool(re.search(r'[A-Z]', password)),
            'lowercase': bool(re.search(r'[a-z]', password)),
            'numbers': bool(re.search(r'\d', password)),
            'special': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password)),
            'no_common_patterns': self._check_patterns(password)
        }
        
        return {
            'score': result['score'],  # 0-4 scale
            'crack_time': result['crack_times_display']['offline_slow_hashing_1e4_per_second'],
            'feedback': result['feedback'],
            'checks': checks,
            'strength_label': self._get_label(result['score']),
            'password_length': len(password)
        }
    
    def _check_patterns(self, password):
        """Check for common weak patterns"""
        common_patterns = [
            '123', 'abc', 'qwerty', 'password', 'admin', 
            'letmein', 'welcome', '111', '000'
        ]
        password_lower = password.lower()
        return not any(pattern in password_lower for pattern in common_patterns)
    
    def _get_label(self, score):
        """Convert numeric score to readable label"""
        labels = {
            0: 'Very Weak',
            1: 'Weak',
            2: 'Fair',
            3: 'Strong',
            4: 'Very Strong'
        }
        return labels.get(score, 'Unknown')