import hashlib
import requests

class BreachChecker:
    """Check if password appears in known data breaches using HIBP API"""
    
    HIBP_API_URL = "https://api.pwnedpasswords.com/range/"
    
    def check_password(self, password):
        """
        Uses k-anonymity model - only sends first 5 chars of password hash
        This keeps your password private!
        """
        try:
            # Hash the password with SHA-1
            sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
            
            # Split: first 5 chars (prefix) and rest (suffix)
            prefix = sha1_hash[:5]
            suffix = sha1_hash[5:]
            
            # Send only the prefix to HIBP API
            response = requests.get(
                f"{self.HIBP_API_URL}{prefix}",
                timeout=5
            )
            
            if response.status_code != 200:
                return {
                    'breached': False,
                    'count': 0,
                    'error': 'Breach check service unavailable',
                    'checked': False
                }
            
            # Check if our suffix appears in the response
            hashes = (line.split(':') for line in response.text.splitlines())
            
            for hash_suffix, count in hashes:
                if hash_suffix == suffix:
                    return {
                        'breached': True,
                        'count': int(count),
                        'message': f'⚠️ This password has been seen {count} times in data breaches!',
                        'severity': self._get_severity(int(count)),
                        'checked': True
                    }
            
            # Password not found in breaches
            return {
                'breached': False,
                'count': 0,
                'message': '✓ Password not found in known data breaches',
                'checked': True
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'breached': False,
                'count': 0,
                'error': f'Network error: {str(e)}',
                'checked': False
            }
        except Exception as e:
            return {
                'breached': False,
                'count': 0,
                'error': f'Unexpected error: {str(e)}',
                'checked': False
            }
    
    def _get_severity(self, count):
        """Determine how severe the breach is based on count"""
        if count > 100000:
            return 'critical'
        elif count > 10000:
            return 'high'
        elif count > 1000:
            return 'medium'
        else:
            return 'low'