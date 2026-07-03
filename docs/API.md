# toss-contract-app API Documentation

Last updated: 2026-07-04

## Overview

This document describes the API endpoints and Edge Functions for the toss-contract-app application.

---

## Supabase Edge Functions

Base URL: `https://your-project.supabase.co/functions/v1/`

### Authentication

All Edge Functions require Supabase authentication via the `Authorization` header:
```
Authorization: Bearer {SUPABASE_ANON_KEY}
```

---

### Contract Management Functions

#### 1. contracts-send
**Endpoint**: `POST /functions/v1/contracts-send`

**Description**: Sends a new contract to a worker via SMS/link.

**Request Body**:
```typescript
{
  contractId: string;
  workerPhone: string;
  workerName: string;
  employerName: string;
  businessName: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Usage**: Creates contract invitation and sends SMS to worker.

---

#### 2. contracts-sign
**Endpoint**: `POST /functions/v1/contracts-sign`

**Description**: Processes worker's signature on a contract.

**Request Body**:
```typescript
{
  contractId: string;
  signatureDataUrl: string;
  workerPhone: string;
  workerAddress: string;
  workerBank?: string;
  workerAccount?: string;
  parentConsentData?: string; // For young workers
}
```

**Response**:
```typescript
{
  success: boolean;
  contractId?: string;
  error?: string;
}
```

**Usage**: Finalizes worker signature and contract completion.

---

#### 3. contracts-complete
**Endpoint**: `POST /functions/v1/contracts-complete`

**Description**: Marks contract as completed by both parties.

**Request Body**:
```typescript
{
  contractId: string;
  documentPdfDataUrl: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  documentUrl?: string;
  error?: string;
}
```

**Usage**: Stores final PDF document of signed contract.

---

#### 4. contracts-cancel
**Endpoint**: `POST /functions/v1/contracts-cancel`

**Description**: Cancels a pending contract.

**Request Body**:
```typescript
{
  contractId: string;
  reason?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  error?: string;
}
```

---

#### 5. contracts-reject
**Endpoint**: `POST /functions/v1/contracts-reject`

**Description**: Worker rejects a contract proposal.

**Request Body**:
```typescript
{
  contractId: string;
  reason?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  error?: string;
}
```

---

#### 6. contracts-view
**Endpoint**: `GET /functions/v1/contracts-view?contractId={id}`

**Description**: Retrieves contract details for viewing.

**Query Parameters**:
- `contractId` (string, required): Contract ID

**Response**:
```typescript
{
  contract: {
    id: string;
    worker_name: string;
    employer_name: string;
    business_name: string;
    status: string;
    // ... other contract fields
  };
  error?: string;
}
```

---

#### 7. contracts-expire
**Endpoint**: `POST /functions/v1/contracts-expire`

**Description**: Marks contract as expired (scheduled job).

**Request Body**:
```typescript
{
  contractId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  error?: string;
}
```

---

### Parent Consent Functions

#### 8. contracts-parent-consent
**Endpoint**: `POST /functions/v1/contracts-parent-consent`

**Description**: Sends parent consent SMS for young workers (under 15).

**Request Body**:
```typescript
{
  contractId: string;
  parentPhone: string;
  workerName: string;
  parentName: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Environment Variables Required**:
- `SOLAPI_API_KEY`: Solapi API key
- `SOLAPI_API_SECRET`: Solapi API secret
- `SOLAPI_SENDER_NUMBER`: Sender phone number

**Usage**: Sends consent request SMS to parent/guardian.

---

### Business Validation Functions

#### 9. business-validator
**Endpoint**: `POST /functions/v1/business-validator`

**Description**: Validates business registration information.

**Request Body**:
```typescript
{
  businessRegistrationNumber: string;
  businessName: string;
  businessType: string;
  // ... other business fields
}
```

**Response**:
```typescript
{
  valid: boolean;
  errors?: string[];
}
```

---

### Authentication Functions

#### 10. auth-token
**Endpoint**: `POST /functions/v1/auth-token`

**Description**: Generates or refreshes authentication tokens.

**Request Body**:
```typescript
{
  userId?: string;
  refreshToken?: string;
}
```

**Response**:
```typescript
{
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  error?: string;
}
```

---

## Client-Side API Hooks

### useContracts Hook

**Location**: `src/hooks/useContracts.ts`

**Methods**:
- `getContract(id: string)`: Fetch single contract
- `getContracts()`: Fetch all user contracts
- `createContract(data: ContractData)`: Create new contract
- `updateContract(id: string, data: Partial<ContractData>)`: Update contract
- `signContract(data: SignData)`: Sign contract
- `sendContract(id: string)`: Send to worker
- `cancelContract(id: string)`: Cancel contract

**Error Handling**:
```typescript
const { contracts, loading, error, refetch } = useContracts();

if (error) {
  // Show error UI with retry button
}
```

---

### useBusiness Hook

**Location**: `src/hooks/useBusiness.ts`

**Methods**:
- `getBusinesses()`: Fetch all businesses
- `createBusiness(data: BusinessData)`: Create business
- `updateBusiness(id: string, data: Partial<BusinessData>)`: Update business

**Error Handling**:
```typescript
const { businesses, loading, error, refetch } = useBusiness();

if (error) {
  // Show error UI with retry button
}
```

---

## Database Schema

### Contracts Table

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
  employer_id UUID REFERENCES auth.users(id);
  worker_id UUID REFERENCES auth.users(id);
  business_id UUID REFERENCES businesses(id);

  -- Contract details
  worker_name TEXT NOT NULL;
  worker_birth_date TEXT;
  worker_phone TEXT;
  worker_address TEXT;
  worker_bank TEXT;
  worker_account TEXT;

  employment_type TEXT NOT NULL;
  workplace TEXT;
  start_date TEXT NOT NULL;
  end_date TEXT;
  work_days TEXT;
  daily_hours TEXT;
  wages TEXT;
  payment_date TEXT;

  -- Status tracking
  status TEXT DEFAULT 'draft';
  doc_parent_consent_status TEXT;
  doc_family_cert_status TEXT;
  doc_employment_permit_status TEXT;

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW();
  updated_at TIMESTAMPTZ DEFAULT NOW();

  -- Document storage
  document_url TEXT;
  signature_data_url TEXT;

  -- Parent consent (for young workers)
  parent_consent_data TEXT;
  parent_consent_sent_at TIMESTAMPTZ;
);
```

### Businesses Table

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
  owner_id UUID REFERENCES auth.users(id);

  -- Business details
  business_registration_number TEXT NOT NULL UNIQUE;
  business_name TEXT NOT NULL;
  business_type TEXT;
  business_address TEXT;
  owner_name TEXT;

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW();
  updated_at TIMESTAMPTZ DEFAULT NOW();
);
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `NETWORK_ERROR` | Network connectivity issue |
| `AUTH_ERROR` | Authentication/authorization failed |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `PERMISSION_DENIED` | User lacks permission |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SMS_SEND_FAILED` | SMS delivery failed |
| `INVALID_SIGNATURE` | Signature verification failed |

---

## Rate Limits

- **SMS Functions**: 10 requests per minute per user
- **Contract Operations**: 100 requests per minute per user
- **Business Validation**: 20 requests per minute per user

---

## Webhooks

### Contract Status Changes

**Event**: `contract.status_changed`

**Payload**:
```typescript
{
  contractId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}
```

---

## Testing

### Local Development

1. Start Supabase local:
```bash
supabase start
```

2. Test Edge Functions:
```bash
curl -X POST http://localhost:54321/functions/v1/contracts-send \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contractId": "test-123", "workerPhone": "+821012345678"}'
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid Supabase JWT
2. **Row Level Security**: Enabled on all tables
3. **Input Validation**: Zod schemas validate all inputs
4. **Rate Limiting**: Implemented on SMS endpoints
5. **PII Protection**: Phone numbers and personal data encrypted

---

## Migration Notes

### Recent Changes

- **2026-07-04**: Added parent consent SMS functionality
- **2026-07-04**: Enhanced error handling across all hooks
- **2026-07-04**: Improved network fault tolerance

---

## Support

For API issues or questions:
- GitHub Issues: [toss-contract-app/issues]
- Documentation: [PROGRESS.md](../PROGRESS.md)
