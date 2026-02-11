from flask import Blueprint, request, jsonify, make_response
from flask_cors import cross_origin
from app.services.strength_checker import PasswordStrengthChecker
from app.services.breach_checker import BreachChecker

api = Blueprint('api', __name__)
strength_checker = PasswordStrengthChecker()
breach_checker = BreachChecker()

@api.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Password Analyzer API is running!'
    })

@api.route('/api/analyze', methods=['POST', 'OPTIONS'])
@cross_origin()
def analyze_password():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({'error': 'Password required'}), 400
    
    if len(password) > 128:
        return jsonify({'error': 'Password too long (max 128 characters)'}), 400
    
    strength = strength_checker.analyze(password)
    breach = breach_checker.check_password(password)
    
    overall_status = 'secure'
    warnings = []
    
    if breach['breached']:
        overall_status = 'critical'
        warnings.append('Password found in data breaches')
    elif strength['score'] < 2:
        overall_status = 'weak'
        warnings.append('Password strength is too low')
    elif strength['score'] < 3:
        overall_status = 'moderate'
    
    return jsonify({
        'strength': strength,
        'breach': breach,
        'overall_status': overall_status,
        'warnings': warnings,
        'timestamp': 'now'
    })

@api.route('/api/test-breach', methods=['GET'])
def test_breach():
    """Test endpoint to verify breach checking works"""
    # "password" is a commonly breached password
    test_result = breach_checker.check_password('password')
    return jsonify({
        'test': 'Checking commonly breached password: "password"',
        'result': test_result
    })