// ── Shared / existing types ────────────────────────────────────────────────

export interface EventType {
  _id: string;
  projectId: string;
  name: string;
  version: string;
  description?: string;
  schema?: object;
  samplePayload?: object;
  isActive: boolean;
  tags: string[];
  maxDeliverySeconds: number;
  defaultTtlSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalWebhook {
  _id: string;
  projectId: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  description?: string;
  lastFiredAt?: string;
  totalFired: number;
  createdAt: string;
}

export interface Tunnel {
  tunnelId: string;
  publicUrl: string;
  active: boolean;
}

export interface PortalBranding {
  companyName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily: string;
  darkMode: boolean;
  customDomain?: string;
  supportEmail?: string;
  portalTitle: string;
  customCss?: string;
  socialLinks?: Record<string, string>;
}

export interface PortalToken {
  _id: string;
  projectId: string;
  name?: string;
  token: string;
  // Customer info
  customerName: string;
  customerEmail?: string;
  expiresAt?: string;
  // Basic branding
  brandColor?: string;
  logoUrl?: string;
  // Extended branding
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string;
  faviconUrl?: string;
  fontFamily?: string;
  darkMode?: boolean;
  customDomain?: string;
  supportEmail?: string;
  portalTitle?: string;
  customCss?: string;
  // Status
  isActive: boolean;
  subscribedEventTypes: string[];
  createdAt: string;
}

export interface UsageSummary {
  plan: string;
  limits: { events: number; endpoints: number; projects: number; retention: number };
  percentUsed: { events: number };
  overage: { events: number; estimatedCost: number; currency: string };
  thisMonth: { events: number; delivered: number; failed: number; successRate: number };
  lastMonth: { events: number; delivered: number; failed: number; successRate: number };
  bandwidth?: { bytes: number; requests: number };
}

export interface WebhookEvent {
  _id: string;
  projectId: string;
  endpointId: string;
  eventType: string;
  status: string;
  retryCount: number;
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  expiresAt?: string;
  createdAt: string;
}

export type SignatureScheme = 'hmac-sha256' | 'ed25519';
export type EndpointType   = 'http' | 's3' | 'gcs';
export type AuthType       = 'none' | 'bearer_token' | 'oauth2' | 'mtls';
export type RetryStrategy  = 'exponential' | 'linear' | 'fixed';

export interface MaintenanceWindow {
  dayOfWeek: number;
  startHour: number;
  endHour:   number;
}

export interface OAuth2Config {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
  audience?: string;
}

export interface MtlsConfig {
  certificate: string;
  privateKey: string;
  caCertificate?: string;
}

export interface StorageConfig {
  bucket: string;
  region?: string;
  prefix?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  serviceAccountKey?: string;
}

export interface Endpoint {
  _id: string;
  projectId: string;
  name: string;
  url?: string;
  eventTypes?: string[];
  timeoutMs: number;
  isActive: boolean;
  signatureScheme: SignatureScheme;
  endpointType: EndpointType;
  authType: AuthType;
  deduplicationWindowSecs?: number;
  batchingEnabled:        boolean;
  batchWindowSeconds:     number;
  batchMaxSize:           number;
  allowedIps:             string[];
  piiFields:              string[];
  canaryUrl?:             string;
  canaryPercent:          number;
  canaryDelivered:        number;
  canaryFailed:           number;
  shadowUrl?:             string;
  maxPayloadBytes:        number;
  maxRetries:             number;
  retryStrategy:          RetryStrategy;
  retryFixedDelaySeconds: number;
  maintenanceWindows:     MaintenanceWindow[];
  createdAt: string;
  updatedAt?: string;
}

export interface EndpointCreateExtended {
  name: string;
  url?: string;
  eventTypes?: string[];
  timeoutMs?: number;
  signatureScheme?: SignatureScheme;
  endpointType?: EndpointType;
  authType?: AuthType;
  deduplicationWindowSecs?: number;
  bearerToken?: string;
  oauth2Config?: OAuth2Config;
  mtlsConfig?: MtlsConfig;
  storageConfig?: StorageConfig;
  maxRetries?: number;
  retryStrategy?: RetryStrategy;
  retryFixedDelaySeconds?: number;
  maintenanceWindows?: MaintenanceWindow[];
  batchingEnabled?: boolean;
  batchWindowSeconds?: number;
  batchMaxSize?: number;
  maxPayloadBytes?: number;
  piiFields?: string[];
  allowedIps?: string[];
  shadowUrl?: string;
  canaryUrl?: string;
  canaryPercent?: number;
}

export const OPERATIONAL_EVENTS = [
  'endpoint.disabled',
  'endpoint.recovered',
  'dlq.event_added',
  'dlq.threshold_reached',
  'circuit.opened',
  'circuit.closed',
  'delivery.failure',
  'billing.limit_reached',
  'billing.overage',
  'sla.breach',
] as const;

export type OperationalEvent = typeof OPERATIONAL_EVENTS[number];

export const PORTAL_FONTS = [
  'Inter','Roboto','Open Sans','Lato','Poppins','DM Sans','Geist','Space Grotesk','IBM Plex Sans',
] as const;

export interface HeatmapCell { total: number; success: number; failed: number }
export interface DeliveryHeatmap {
  matrix: HeatmapCell[][];
  days: string[];
}

export interface EraseResult {
  deletedEvents: number;
  deletedLogs: number;
}

export interface ContractTestResult {
  valid: boolean;
  errors: { path: string; message: string }[];
}

export interface SimulateResult {
  simulatedPayload: Record<string, any>;
  eventType: string;
  version: string;
}

export type EventPriority = 'p0' | 'p1' | 'p2' | 'p3';

export const PRIORITY_CONFIG: Record<EventPriority, { label: string; color: string; emoji: string; desc: string }> = {
  p0: { label: 'P0', emoji: '🔴', color: '#f87171', desc: 'Critical — payments, auth' },
  p1: { label: 'P1', emoji: '🟠', color: '#fb923c', desc: 'High — orders, alerts' },
  p2: { label: 'P2', emoji: '🟡', color: '#94a3b8', desc: 'Normal (default)' },
  p3: { label: 'P3', emoji: '🟢', color: '#4ade80', desc: 'Low — analytics, logs' },
};

// ── AI Feature Types ──────────────────────────────────────────────────────────

export interface AiProviderStatus {
  provider: 'deepseek' | 'gemini' | 'none';
  label: string;
  configured: boolean;
}

export interface AiDebugResponse {
  question: string;
  answer: string;
  rootCause: string;
  suggestedActions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedEvents: number;
}

export interface AiGeneratedSchema {
  suggestedName: string;
  suggestedDescription: string;
  version: string;
  tags: string[];
  jsonSchema: Record<string, any>;
  samplePayload: Record<string, any>;
}

export interface DlqTriageGroup {
  pattern: string;
  failureType: 'network' | 'auth' | 'client_error' | 'server_error' | 'schema' | 'timeout' | 'unknown';
  count: number;
  eventIds: string[];
  suggestedFix: string;
  fixCommand: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  canAutoReplay: boolean;
}

export interface DlqTriageReport {
  totalDead: number;
  groups: DlqTriageGroup[];
  summary: string;
  quickWins: string[];
  estimatedRecoveryRate: number;
}

export interface PiiDetectedField {
  path: string;
  type: 'email' | 'phone' | 'name' | 'address' | 'credit_card' | 'ssn' | 'ip_address' | 'auth_token' | 'api_key' | 'dob' | 'national_id' | 'other';
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export interface PiiDetectionResult {
  detectedFields: PiiDetectedField[];
  piiPaths: string[];
  summary: string;
  applied: boolean;
}

// ── 2FA Types ─────────────────────────────────────────────────────────────────

export interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
  recoveryCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  enabledAt?: string;
}

export interface TwoFactorLoginResponse {
  requiresTwoFactor: true;
  challengeToken: string;
}

// ── Scheduled Event Types ─────────────────────────────────────────────────────

export type ScheduledEventStatus =
  | 'pending' | 'queued' | 'delivered' | 'cancelled' | 'failed' | 'expired';

export interface ScheduledEvent {
  _id: string;
  projectId: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, any>;
  scheduledFor: string;
  status: ScheduledEventStatus;
  priority: EventPriority;
  idempotencyKey?: string;
  dispatchedEventId?: string;
  cancelledReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Permissions / RBAC Types ──────────────────────────────────────────────────

export interface CustomRole {
  _id: string;
  name: string;
  description?: string;
  projectId: string;
  workspaceId?: string;
  permissions: string[];
  createdBy: string;
  isActive: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionMatrix {
  resources: string[];
  actions: string[];
  roles: Record<string, string[]>;
}

export interface PermissionDiff {
  role1: string;
  role2: string;
  onlyInRole1: string[];
  onlyInRole2: string[];
  shared: string[];
}

// ── Realtime Event Types ──────────────────────────────────────────────────────

export interface RealtimeDeliveryEvent {
  type: 'delivery.success' | 'delivery.failed' | 'delivery.dead' | 'delivery.retry' | 'delivery.filtered' | 'delivery.rate_queued';
  eventId: string;
  endpointId: string;
  projectId: string;
  eventType: string;
  status: string;
  statusCode?: number;
  latencyMs?: number;
  retryCount?: number;
  timestamp: string;
}

// ── Billing Types ──────────────────────────────────────────────────────────────

export type SubStatus =
  | 'trial' | 'trial_expired' | 'active' | 'past_due'
  | 'cancelled' | 'suspended' | 'credit_only';

export interface TrialInfo {
  status: SubStatus;
  planName: string;
  trialEndAt?: string;
  daysLeft?: number;
}

export interface PlanFeatures {
  analytics: boolean;
  ai: boolean;
  slaMonitoring: boolean;
  reseller: boolean;
  mtls: boolean;
  customDomains: boolean;
  priorityQueue: boolean;
  eventCatalog: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  eventsPerMonth: number;
  endpointsLimit: number;
  retentionDays: number;
  features: PlanFeatures;
}

export interface Subscription {
  status: SubStatus;
  planId: string;
  planName: string;
  daysLeft?: number;
  currentPeriodEnd?: string;
  eventsPerMonth: number;
  endpointsLimit: number;
  features?: PlanFeatures;
}

export interface CreditsBalance {
  balance: number;
  lifetimePurchased: number;
  lifetimeUsed: number;
  autoTopUpEnabled: boolean;
  autoTopUpThreshold?: number;
  autoTopUpPackageId?: string;
}

export interface CreditPackage {
  _id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  price: number;
  description: string;
}

export interface CreditTransaction {
  _id?: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  type: 'subscription' | 'credit' | 'usage';
  status: 'paid' | 'open' | 'void';
  total: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
}

export interface ResellerProfile {
  companyName: string;
  logoUrl?: string;
  supportEmail: string;
  webhookPortalDomain?: string;
  defaultMarkupPct: number;
  pricePerThousandEvents: number;
}

export interface ResellerCustomer {
  customerId: string;
  customer: { email: string; firstName?: string; lastName?: string };
  currentMonthEvents: number;
  pricePerThousandEvents: number;
  isActive: boolean;
}

export interface ResellerRevenue {
  totalCollected: number;
  paidInvoices: number;
  totalCustomers: number;
}

export interface ResellerPlan {
  _id?: string;
  name: string;
  description?: string;
  priceMonthly: number;
  eventsPerMonth: number;
  endpointsLimit: number;
  retentionDays: number;
}
