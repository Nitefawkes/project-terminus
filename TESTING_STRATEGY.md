# Testing Strategy for Project Terminus

**Last Updated:** November 23, 2024
**Status:** Framework in place, tests to be implemented

---

## Overview

This document outlines the testing strategy for Project Terminus, including unit testing, integration testing, and end-to-end testing approaches.

## Current State

### Backend Testing

**Framework:** Jest + @nestjs/testing
**Status:** Configured and ready

**Configuration** (`backend/package.json`):
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "testEnvironment": "node"
  }
}
```

### Frontend Testing

**Framework:** To be configured (recommended: Jest + React Testing Library)
**Status:** Not yet implemented

---

## Testing Levels

### 1. Unit Tests

**Purpose:** Test individual functions and methods in isolation

**Scope:**
- Service methods (business logic)
- Utility functions
- Validators
- Transformers

**Example Structure:**
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should perform expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Challenges Identified:**
- **External Dependencies:** Some libraries (e.g., `rss-parser`) have import issues with Jest
- **Database Mocking:** TypeORM repositories require careful mocking
- **Solution:** Use dependency injection and mock at the boundary

### 2. Integration Tests

**Purpose:** Test how multiple components work together

**Scope:**
- API endpoints (controller + service + database)
- Module interactions
- Database operations

**Example Structure:**
```typescript
describe('ModuleIntegration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should complete full workflow', async () => {
    // Test complete user journey
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Database Strategy:**
- Use in-memory SQLite for fast tests
- Or use Docker with test database
- Clean up after each test

### 3. E2E Tests

**Purpose:** Test entire application workflows from user perspective

**Scope:**
- User registration → login → feature use
- Frontend + Backend integration
- Real browser interactions

**Recommended Tools:**
- **Playwright** or **Cypress** for browser automation
- **Supertest** for API testing without browser

**Example Workflow:**
```
1. Start backend server (test environment)
2. Start frontend dev server
3. Run Playwright tests:
   - Navigate to /login
   - Enter credentials
   - Verify redirect to /feeds
   - Create RSS feed
   - Verify feed appears on map
4. Teardown
```

---

## RSS Module Testing Strategy

### Identified Testing Challenges

#### 1. External API Dependencies

**RSS Parser Service:**
- Depends on `rss-parser` library
- Issue: Import conflicts with Jest/TypeScript
- **Solution:** Integration tests with real feeds or custom mock implementation

**Geocoding Service:**
- Depends on Nominatim API
- Issue: Network calls in tests
- **Solution:** Mock axios, use recorded responses

#### 2. User Context Missing

**Current Issue:** RSS endpoints use `@UseGuards(JwtAuthGuard)` but don't extract user from request.

**Impact:** Feeds are not user-scoped (global access)

**Recommended Fix:**
```typescript
// Add user decorator
import { GetUser } from '../auth/decorators/get-user.decorator';

@Post('feeds')
async createFeed(
  @GetUser() user: User,
  @Body() createFeedDto: CreateFeedDto
) {
  return this.rssService.createFeed(user.id, createFeedDto);
}
```

**Testing Impact:** Tests need mock user object

### Recommended Test Coverage

#### High Priority (Core Functionality)
1. **Feed CRUD Operations**
   - Create feed with valid data
   - Update feed settings
   - Delete feed
   - List user's feeds

2. **Feed Refresh Logic**
   - Fetch and parse RSS feed
   - Extract items
   - De-duplicate by GUID
   - Update item counts

3. **Geocoding**
   - Extract location from text
   - Geocode location to coordinates
   - Handle API failures gracefully

4. **Authentication**
   - Protect all endpoints with JWT
   - Verify user ownership
   - Test unauthorized access

#### Medium Priority (User Features)
1. **Item Management**
   - Mark as read/unread
   - Star/unstar items
   - Delete items
   - Filter by various criteria

2. **Map Integration**
   - Return only geocoded items
   - Filter by map bounds
   - Respect user filters

#### Low Priority (Edge Cases)
1. **Error Handling**
   - Invalid RSS feed URL
   - Malformed XML
   - Network timeouts
   - API rate limits

2. **Performance**
   - Large feeds (1000+ items)
   - Many concurrent refreshes
   - Database query optimization

---

## Testing Best Practices

### General Principles

1. **AAA Pattern**
   - Arrange: Set up test data
   - Act: Execute the code under test
   - Assert: Verify the results

2. **Test Independence**
   - Each test should run independently
   - Use `beforeEach` to reset state
   - Don't rely on test execution order

3. **Meaningful Names**
   - `should return user feeds when user is authenticated`
   - Not: `test1`

4. **One Assertion Per Test** (guideline, not rule)
   - Focus on single behavior
   - Makes failures easier to diagnose

### Mocking Guidelines

#### When to Mock
- External APIs (HTTP requests)
- File system operations
- Time/Date functions
- Random number generation

#### When NOT to Mock
- Database (use test DB instead)
- Simple utility functions
- Type conversions
- Constructors

#### Mock Example
```typescript
const mockRSSService = {
  createFeed: jest.fn(),
  findAllFeeds: jest.fn(),
  refreshFeed: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});
```

### Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

**Critical Paths:** 100% coverage
- Authentication logic
- Authorization checks
- Payment processing (if added)
- Security-sensitive operations

---

## Test Data Management

### Fixtures

Create reusable test data:

```typescript
// test/fixtures/feed.fixture.ts
export const mockFeed = {
  id: 'test-feed-123',
  name: 'Test Feed',
  url: 'https://example.com/feed.xml',
  type: FeedType.NEWS,
  subtype: 'global',
  enabled: true,
};

export const mockRSSResponse = `
  <?xml version="1.0"?>
  <rss version="2.0">
    <channel>
      <title>Test Feed</title>
      <item>
        <title>Test Article</title>
        <link>https://example.com/article</link>
        <guid>test-123</guid>
      </item>
    </channel>
  </rss>
`;
```

### Factory Functions

```typescript
export function createMockFeed(overrides = {}) {
  return {
    ...mockFeed,
    ...overrides,
  };
}
```

---

## Security Testing

### Authentication Tests
- ✅ Valid JWT accepted
- ✅ Invalid JWT rejected
- ✅ Expired JWT rejected
- ✅ Missing JWT rejected

### Authorization Tests
- ✅ User can only access own feeds
- ✅ User cannot access other users' feeds
- ✅ User cannot delete other users' items

### XSS Prevention Tests
- ✅ Malicious titles escaped
- ✅ Malicious URLs sanitized
- ✅ Script tags removed from content

**Already Implemented:** XSS protection in `RSSLayer.tsx` with `escapeHtml()` and `sanitizeUrl()`

---

## Performance Testing

### Load Testing
- Use **Artillery** or **k6** for API load testing
- Test scenarios:
  - 100 concurrent users refreshing feeds
  - 1000+ items in single feed
  - Multiple feeds refreshing simultaneously

### Metrics to Monitor
- Response time (p50, p95, p99)
- Requests per second
- Error rate
- Memory usage
- Database connection pool

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci
        working-directory: ./backend

      - name: Run tests
        run: npm test -- --coverage
        working-directory: ./backend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Current Test Files

### Backend
- ❌ `rss-parser.service.spec.ts` - Removed (import issues)
- ❌ `geocoding.service.spec.ts` - Removed (implementation mismatch)
- ❌ `rss.controller.spec.ts` - Removed (needs user context fix)
- ⏳ To be created: Integration tests

### Frontend
- ⏳ Component tests (React Testing Library)
- ⏳ Hook tests
- ⏳ Store tests (Zustand)
- ⏳ E2E tests (Playwright)

---

## Next Steps

### Immediate (This Sprint)
1. Fix user context in RSS controller
2. Create integration tests for RSS endpoints
3. Set up test database
4. Add coverage reporting

### Short Term (Next Sprint)
1. Frontend component tests
2. E2E test suite with Playwright
3. CI/CD integration
4. Security test suite

### Long Term
1. Performance/load tests
2. Visual regression tests
3. Accessibility tests
4. Cross-browser testing

---

## Resources

### Documentation
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)

### Tools
- **Jest:** Unit and integration testing
- **Supertest:** HTTP assertion library
- **React Testing Library:** Component testing
- **Playwright:** E2E browser testing
- **Artillery:** Load testing
- **Codecov:** Coverage reporting

---

## Conclusion

While automated tests are not yet fully implemented, the testing infrastructure is in place and the strategy is defined. The identified challenges (external library mocking, missing user context) provide clear direction for implementation.

**Priority:** Fix architectural issues (user scoping) before writing comprehensive tests to avoid rewriting tests when architecture changes.

**Next Action:** Implement user context in RSS module, then write integration tests for complete workflows.

---

*Last Updated: November 23, 2024*
*Maintained by: Development Team*
