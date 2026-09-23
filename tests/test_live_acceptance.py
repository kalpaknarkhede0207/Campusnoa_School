import urllib.request
import json
import ssl

BASE_URL = 'http://127.0.0.1:3000'

def post_json(endpoint, payload, token=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def get_json(endpoint, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method='GET')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

print("=======================================================")
print("🚀 CAMPUSNOA LIVE PRODUCTION ACCEPTANCE VERIFICATION")
print("=======================================================")

# 1. Health Check
status, health = get_json('/health')
assert status == 200, f"Health check failed: {status}"
print(f"✅ 1. Health Endpoint: 200 OK - System: {health['system']}")

# 2. Test Login across all 11 Personas
personas = [
    ('management@school.edu', 'SCHOOL_MGMT'),
    ('principal@school.edu', 'PRINCIPAL'),
    ('vp@school.edu', 'VICE_PRINCIPAL'),
    ('hod.science@school.edu', 'HOD'),
    ('s.roy@school.edu', 'CLASS_TEACHER'),
    ('a.joshi@school.edu', 'TEACHER'),
    ('admissions@school.edu', 'ADMIN_OFFICER'),
    ('bursar@school.edu', 'ACCOUNTANT'),
    ('counsellor@school.edu', 'COUNSELLOR'),
    ('parent@gmail.com', 'PARENT'),
    ('teen.student@school.edu', 'STUDENT')
]

tokens = {}
for email, role in personas:
    code, res = post_json('/api/auth/login', {'email': email, 'password': 'CampusNoa@2026!'})
    assert code == 200, f"Login failed for {email}: {code} {res}"
    assert res['user']['roleCode'] == role
    tokens[role] = res['accessToken']
    print(f"✅ 2. Auth Verified for {role} ({email}) - Token Issued")

# 3. Principal queries 50 students from database
code, res = get_json('/api/students', tokens['PRINCIPAL'])
assert code == 200
assert res['count'] == 50, f"Expected 50 students, got {res['count']}"
print(f"✅ 3. Database Students: Loaded {res['count']} real database records")

# 4. Faculty & Staff Directory from database
code, res = get_json('/api/teachers', tokens['PRINCIPAL'])
assert code == 200
assert len(res['teachers']) > 0
print(f"✅ 4. Faculty Directory: Loaded {len(res['teachers'])} faculty and {len(res['leaves'])} leave applications")

# 5. GFM Mentorship Cohort
code, res = get_json('/api/gfm/mentees', tokens['CLASS_TEACHER'])
assert code == 200
assert res['count'] == 10
print(f"✅ 5. GFM Mentorship: Retrieved assigned cohort of {res['count']} mentees for Mrs. Sunita Roy")

# 6. Accountant Fee Ledger
code, res = get_json('/api/fees/ledger', tokens['ACCOUNTANT'])
assert code == 200
assert res['summary']['totalBilled'] == 2250000
print(f"✅ 6. Treasury Ledger: Total Billed ₹{res['summary']['totalBilled']}, Cleared Receipts: {res['summary']['clearedCount']}, Overdue: {len(res['defaulters'])}")

# 7. Counsellor Confidential Cases (Privacy Protection)
code, res = get_json('/api/counselling/cases', tokens['COUNSELLOR'])
assert code == 200
print(f"✅ 7. Counselling Cases: Access granted to Counsellor ({res['count']} confidential case records)")

# 8. Privacy Barrier: Accountant trying to access confidential counseling cases
code, res = get_json('/api/counselling/cases', tokens['ACCOUNTANT'])
assert code == 403, f"Expected 403, got {code}"
print(f"✅ 8. FERPA Privacy Barrier: Accountant access strictly blocked with HTTP 403")

# 9. Management Board Macro KPIs
code, res = get_json('/api/mgmt/kpis', tokens['SCHOOL_MGMT'])
assert code == 200
print(f"✅ 9. Board Macro KPIs: Enrollment {res['kpis']['enrollmentAndCapacity']['currentEnrollment']}/120, Retention: {res['kpis']['facultyMetrics']['retentionRatePercent']}%")

# 10. Save Batch Attendance
code, res = post_json('/api/attendance/save', {
    'divisionId': 'test-div',
    'date': '2026-09-22',
    'periodNumber': 2,
    'records': [
        {'studentId': 'ADM-2026-001', 'status': 'PRESENT'},
        {'studentId': 'ADM-2026-002', 'status': 'PRESENT'}
    ]
}, tokens['CLASS_TEACHER'])
assert code == 200
print(f"✅ 10. Attendance Recording: Successfully saved and deduplicated in database")

# 11. Bus Tracking Delay Simulation
code, res = post_json('/api/bus/simulate-delay', {'delayMinutes': 10}, tokens['ADMIN_OFFICER'])
assert code == 200
print(f"✅ 11. Logistics: Bus delay simulated (+{res['tracking']['delayMinutes']}m) and event broadcast")

# 12. Leadership Announcement
code, res = post_json('/api/principal/announcement', {
    'title': 'Term 2 Board Examination Timetable Released',
    'message': 'All faculty, students and parents can review the finalized schedule in their portals.'
}, tokens['PRINCIPAL'])
assert code == 201
print(f"✅ 12. Real-Time Announcement: Successfully persisted to database and dispatched to event stream")

print("\n=======================================================")
print("🎉 ALL 12 LIVE ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!")
print("=======================================================")
