const fs = require('fs');
const path = require('path');

const employeeId1 = '22222222-2222-2222-2222-222222222222';
const salaryStructureId = '44444444-4444-4444-4444-444444444444';

const testScript = (assertions) => {
  return [
    "pm.test('Status is correct', function () {",
    "    " + assertions.status,
    "});",
    "pm.test('Response shape is correct', function () {",
    "    const jsonData = pm.response.json();",
    "    " + assertions.shape,
    "});",
    ...(assertions.extra || [])
  ];
};

const authTests = (statusCode, successVal) => testScript({
  status: `pm.response.to.have.status(${statusCode});`,
  shape: `pm.expect(jsonData).to.have.property('success', ${successVal});\n    if (${successVal}) pm.expect(jsonData).to.have.property('data');\n    else pm.expect(jsonData).to.have.property('error');`
});

const collection = {
  info: {
    name: "PeoplePay360 API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    {
      name: "Auth",
      item: [
        {
          name: "Register (Employee)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] },
            body: { mode: "raw", raw: JSON.stringify({ email: `test_${Date.now()}@postman.com`, password: "SecurePass1!", role: "employee" }) }
          },
          event: [{ listen: "test", script: { exec: authTests(201, true) } }]
        },
        {
          name: "Login",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] },
            body: { mode: "raw", raw: JSON.stringify({ email: "admin@peoplepay360.local", password: "AdminPass1!" }) }
          },
          event: [{
            listen: "test",
            script: {
              exec: [
                ...authTests(200, true),
                "const jsonData = pm.response.json();",
                "pm.environment.set('accessToken', jsonData.data.accessToken);"
              ]
            }
          }]
        },
        {
          name: "Me",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/api/auth/me", host: ["{{baseUrl}}"], path: ["api", "auth", "me"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Refresh",
          request: {
            method: "POST",
            header: [], // relies on cookie set by Login
            url: { raw: "{{baseUrl}}/api/auth/refresh", host: ["{{baseUrl}}"], path: ["api", "auth", "refresh"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Logout",
          request: {
            method: "POST",
            header: [],
            url: { raw: "{{baseUrl}}/api/auth/logout", host: ["{{baseUrl}}"], path: ["api", "auth", "logout"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        }
      ]
    },
    {
      name: "Payroll",
      item: [
        {
          name: "Login Admin (setup)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] },
            body: { mode: "raw", raw: JSON.stringify({ email: "admin@peoplepay360.local", password: "AdminPass1!" }) }
          },
          event: [{ listen: "test", script: { exec: ["const jsonData = pm.response.json(); pm.environment.set('accessToken', jsonData.data.accessToken);"] } }]
        },
        {
          name: "Draft Payrun",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/payruns/draft", host: ["{{baseUrl}}"], path: ["api", "payruns", "draft"] },
            body: { mode: "raw", raw: JSON.stringify({ salary_structure_id: salaryStructureId, period_start: "2026-10-01", period_end: "2026-10-31" }) }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Create Payrun",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/payruns", host: ["{{baseUrl}}"], path: ["api", "payruns"] },
            body: { mode: "raw", raw: JSON.stringify({ name: "Oct 2026 Payroll Happy Path", salary_structure_id: salaryStructureId, period_start: "2026-10-01", period_end: "2026-10-31", employee_ids: [employeeId1] }) }
          },
          event: [{ listen: "test", script: { exec: [...authTests(201, true), "const jsonData = pm.response.json(); pm.environment.set('payrunId', jsonData.data.id);"] } }]
        },
        {
          name: "Compute Payrun",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/api/payruns/{{payrunId}}/compute", host: ["{{baseUrl}}"], path: ["api", "payruns", "{{payrunId}}", "compute"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Validate Payrun",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/api/payruns/{{payrunId}}/validate", host: ["{{baseUrl}}"], path: ["api", "payruns", "{{payrunId}}", "validate"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Mark Paid",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }],
            url: { raw: "{{baseUrl}}/api/payruns/{{payrunId}}/mark-paid", host: ["{{baseUrl}}"], path: ["api", "payruns", "{{payrunId}}", "mark-paid"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        }
      ]
    },
    {
      name: "Time Off",
      item: [
        {
          name: "Login Admin (setup)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/auth/login", host: ["{{baseUrl}}"], path: ["api", "auth", "login"] },
            body: { mode: "raw", raw: JSON.stringify({ email: "admin@peoplepay360.local", password: "AdminPass1!" }) }
          },
          event: [{ listen: "test", script: { exec: ["const jsonData = pm.response.json(); pm.environment.set('accessToken', jsonData.data.accessToken);"] } }]
        },
        {
          name: "Create Type",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-types", host: ["{{baseUrl}}"], path: ["api", "time-off-types"] },
            body: { mode: "raw", raw: JSON.stringify({ name: `Annual Leave ${Date.now()}`, category: "paid", unit: "days", requires_approval: true }) }
          },
          event: [{ listen: "test", script: { exec: [...authTests(201, true), "const jsonData = pm.response.json(); pm.environment.set('timeOffTypeId', jsonData.data.id);"] } }]
        },
        {
          name: "Create Allocation",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-allocations", host: ["{{baseUrl}}"], path: ["api", "time-off-allocations"] },
            body: { mode: "raw", raw: JSON.stringify({ employee_id: employeeId1, time_off_type_id: "{{timeOffTypeId}}", allocated: 10, valid_from: "2026-01-01", description: "Yearly" }) }
          },
          event: [{ listen: "test", script: { exec: [...authTests(201, true), "const jsonData = pm.response.json(); pm.environment.set('allocationId', jsonData.data.id);"] } }]
        },
        {
          name: "Approve Allocation",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-allocations/{{allocationId}}/approve", host: ["{{baseUrl}}"], path: ["api", "time-off-allocations", "{{allocationId}}", "approve"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Create Request",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-requests", host: ["{{baseUrl}}"], path: ["api", "time-off-requests"] },
            body: { mode: "raw", raw: JSON.stringify({ employee_id: employeeId1, time_off_type_id: "{{timeOffTypeId}}", allocation_id: "{{allocationId}}", date_from: "2026-11-01", date_to: "2026-11-02", duration: 2, reason: "Vacation" }) }
          },
          event: [{ listen: "test", script: { exec: [...authTests(201, true), "const jsonData = pm.response.json(); pm.environment.set('requestId', jsonData.data.id);"] } }]
        },
        {
          name: "Approve Request",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-requests/{{requestId}}/approve", host: ["{{baseUrl}}"], path: ["api", "time-off-requests", "{{requestId}}", "approve"] }
          },
          event: [{ listen: "test", script: { exec: authTests(200, true) } }]
        },
        {
          name: "Create Request (Over-allocate)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-requests", host: ["{{baseUrl}}"], path: ["api", "time-off-requests"] },
            body: { mode: "raw", raw: JSON.stringify({ employee_id: employeeId1, time_off_type_id: "{{timeOffTypeId}}", allocation_id: "{{allocationId}}", date_from: "2026-12-01", date_to: "2026-12-15", duration: 15, reason: "Too long" }) }
          },
          event: [{ listen: "test", script: { exec: [...authTests(201, true), "const jsonData = pm.response.json(); pm.environment.set('overRequestId', jsonData.data.id);"] } }]
        },
        {
          name: "Approve Request (Over-allocate)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{accessToken}}" }, { key: "Content-Type", value: "application/json" }],
            url: { raw: "{{baseUrl}}/api/time-off-requests/{{overRequestId}}/approve", host: ["{{baseUrl}}"], path: ["api", "time-off-requests", "{{overRequestId}}", "approve"] }
          },
          event: [{ listen: "test", script: { exec: authTests(409, false) } }]
        }
      ]
    }
  ]
};

const env = {
  id: "env-id",
  name: "Local",
  values: [
    { key: "baseUrl", value: "http://localhost:4000", enabled: true }
  ]
};

fs.mkdirSync(path.join(__dirname, '../backend/postman'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../backend/postman/collection.json'), JSON.stringify(collection, null, 2));
fs.writeFileSync(path.join(__dirname, '../backend/postman/environment.json'), JSON.stringify(env, null, 2));
console.log('Files generated.');
