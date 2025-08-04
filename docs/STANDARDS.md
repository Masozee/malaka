# Development Standards & Guidelines

This document establishes coding standards, best practices, and guidelines for the Malaka ERP project.

## Code Style Standards

### Frontend (TypeScript/React)

#### TypeScript Guidelines
- **Strict Mode**: Always use TypeScript strict mode
- **Type Definitions**: Prefer interfaces over types for object shapes
- **Explicit Typing**: Avoid `any`, use proper types
- **Null Safety**: Handle nullable values explicitly

```typescript
//  CORRECT
interface User {
  id: string
  name: string
  email: string | null
}

const fetchUser = async (id: string): Promise<User | null> => {
  // implementation
}

// L INCORRECT
const fetchUser = async (id: any): Promise<any> => {
  // implementation
}
```

#### React Component Guidelines
- **Functional Components**: Use functional components with hooks
- **Component Naming**: PascalCase for components
- **Props Interface**: Define explicit props interfaces
- **Default Exports**: Use default exports for page components

```typescript
//  CORRECT
interface UserCardProps {
  user: User
  onEdit: (id: string) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  )
}
```

#### CSS/Styling Guidelines
- **Tailwind CSS**: Use Tailwind classes, avoid custom CSS
- **Responsive Design**: Mobile-first approach
- **Color System**: Use design token variables
- **Consistent Spacing**: Use standardized spacing scales

```typescript
//  CORRECT
<div className="p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### Backend (Go)

#### Go Code Guidelines
- **Package Naming**: Short, lowercase, single word
- **Function Naming**: Use descriptive names, CamelCase for exported
- **Error Handling**: Always handle errors explicitly
- **Context Usage**: Pass context.Context as first parameter

```go
//  CORRECT
func (s *UserService) CreateUser(ctx context.Context, user *entities.User) error {
    if err := s.validate(user); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    
    if err := s.repo.Create(ctx, user); err != nil {
        return fmt.Errorf("failed to create user: %w", err)
    }
    
    return nil
}
```

#### Database Guidelines
- **Migration Files**: Schema only, no data
- **Seed Files**: Development data in separate files
- **Naming Conventions**: snake_case for database identifiers
- **Indexing**: Add indexes for frequently queried columns

```sql
--  CORRECT: Migration file
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

## Architecture Standards

### Clean Architecture Principles

#### Layer Separation
- **Domain**: Business entities and rules
- **Infrastructure**: External dependencies
- **Presentation**: HTTP handlers and DTOs
- **Shared**: Common utilities

#### Dependency Rules
- **Inward Dependencies**: Dependencies point inward only
- **Interface Segregation**: Small, focused interfaces
- **Dependency Injection**: Use interfaces for external dependencies

### API Design Standards

#### RESTful Conventions
- **HTTP Verbs**: GET, POST, PUT, DELETE
- **Resource Naming**: Plural nouns for collections
- **Status Codes**: Use appropriate HTTP status codes
- **Versioning**: Use `/api/v1` prefix

```
GET    /api/v1/users          # List users
POST   /api/v1/users          # Create user
GET    /api/v1/users/{id}     # Get user
PUT    /api/v1/users/{id}     # Update user
DELETE /api/v1/users/{id}     # Delete user
```

#### Response Format
- **Consistent Structure**: All responses follow same format
- **Error Handling**: Structured error responses
- **Pagination**: Consistent pagination metadata

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

## Data Standards

### Indonesian Localization
- **Currency**: Indonesian Rupiah (IDR) with "Rp" prefix
- **Date Format**: Indonesian locale (id-ID)
- **Number Format**: Indonesian thousand separators
- **Language**: Indonesian field names and labels

```typescript
//  CORRECT: Indonesian formatting
const formatCurrency = (amount: number) => 
  `Rp ${amount.toLocaleString('id-ID')}`

const formatDate = (date: Date) => 
  date.toLocaleDateString('id-ID')
```

### Database Standards
- **UUID**: Use UUIDs for primary keys
- **Timestamps**: Always include created_at and updated_at
- **Soft Deletes**: Use deleted_at for soft deletes
- **Naming**: snake_case for all database identifiers

```sql
--  CORRECT: Standard table structure
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

## Security Standards

### Authentication & Authorization
- **JWT Tokens**: Use JWT for stateless authentication
- **Token Expiration**: Set appropriate expiration times
- **Role-Based Access**: Implement role-based permissions
- **Secure Storage**: Store tokens securely

### Input Validation
- **Frontend Validation**: Client-side validation for UX
- **Backend Validation**: Server-side validation for security
- **Sanitization**: Sanitize all user inputs
- **SQL Injection**: Use parameterized queries

### Environment Security
- **Environment Variables**: Store secrets in environment variables
- **No Hardcoded Secrets**: Never commit secrets to code
- **Development vs Production**: Different configurations
- **CORS**: Proper CORS configuration

## Error Handling Standards

### Frontend Error Handling
- **User-Friendly Messages**: Show clear error messages
- **Error Boundaries**: Catch React errors gracefully
- **Loading States**: Show loading indicators
- **Retry Mechanisms**: Allow users to retry failed operations

```typescript
//  CORRECT: Error handling pattern
const [data, setData] = useState<User[]>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  try {
    setLoading(true)
    setError(null)
    const response = await userService.getAll()
    setData(response.data)
  } catch (err) {
    setError('Failed to load users')
    console.error('Error fetching users:', err)
  } finally {
    setLoading(false)
  }
}
```

### Backend Error Handling
- **Structured Errors**: Use structured error types
- **Error Wrapping**: Wrap errors with context
- **Logging**: Log errors with appropriate levels
- **HTTP Status**: Return correct HTTP status codes

```go
//  CORRECT: Error handling pattern
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    
    user, err := h.service.GetByID(r.Context(), id)
    if err != nil {
        if errors.Is(err, entities.ErrUserNotFound) {
            h.respondWithError(w, http.StatusNotFound, "User not found")
            return
        }
        
        h.logger.Error("failed to get user", zap.Error(err), zap.String("id", id))
        h.respondWithError(w, http.StatusInternalServerError, "Internal server error")
        return
    }
    
    h.respondWithJSON(w, http.StatusOK, user)
}
```

## Testing Standards

### Frontend Testing
- **Unit Tests**: Test components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Type Testing**: TypeScript catches type errors

### Backend Testing
- **Unit Tests**: Test individual functions
- **Integration Tests**: Test with real database
- **API Tests**: Test HTTP endpoints
- **Coverage**: Aim for 80%+ test coverage

```go
//  CORRECT: Test structure
func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name    string
        user    *entities.User
        wantErr bool
    }{
        {
            name: "valid user",
            user: &entities.User{
                Name:  "John Doe",
                Email: "john@example.com",
            },
            wantErr: false,
        },
        {
            name: "invalid email",
            user: &entities.User{
                Name:  "John Doe",
                Email: "invalid-email",
            },
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := service.CreateUser(context.Background(), tt.user)
            if (err != nil) != tt.wantErr {
                t.Errorf("CreateUser() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

## Performance Standards

### Frontend Performance
- **Bundle Size**: Monitor and optimize bundle size
- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Use Next.js Image component
- **Caching**: Implement appropriate caching strategies

### Backend Performance
- **Database Queries**: Optimize database queries
- **Connection Pooling**: Use connection pooling
- **Caching**: Use Redis for frequently accessed data
- **Profiling**: Regular performance profiling

### Database Performance
- **Indexing Strategy**: Add indexes for query optimization
- **Query Optimization**: Use EXPLAIN to analyze queries
- **Connection Limits**: Set appropriate connection limits
- **Monitoring**: Monitor database performance metrics

## Documentation Standards

### Code Documentation
- **Comments**: Write clear, concise comments
- **Function Documentation**: Document public functions
- **API Documentation**: Maintain OpenAPI specifications
- **README Files**: Keep README files updated

### Inline Comments
```typescript
//  CORRECT: Helpful comments
/**
 * Transforms raw attendance data from the backend API into the frontend format.
 * Handles employee matching and time formatting for Indonesian locale.
 */
const transformAttendanceData = (rawData: any[], employees: Employee[]): AttendanceRecord[] => {
  // Map each attendance record to include employee details
  return rawData.map(record => {
    const employee = employees.find(emp => emp.id === record.employee_id)
    // ... implementation
  })
}
```

## Git Standards

### Commit Messages
- **Format**: Use conventional commit format
- **Scope**: Include module scope when relevant
- **Description**: Clear, concise description

```
feat(hr): add employee performance review system
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoint documentation
```

### Branch Naming
- **Feature**: `feature/hr-performance-reviews`
- **Bug Fix**: `fix/auth-token-expiration`
- **Documentation**: `docs/api-documentation`

### Pull Request Guidelines
- **Description**: Clear description of changes
- **Testing**: Include testing instructions
- **Breaking Changes**: Document breaking changes
- **Code Review**: Require code review approval

## Code Review Standards

### Review Checklist
- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean and readable?
- **Performance**: Are there performance implications?
- **Security**: Are there security concerns?
- **Testing**: Are tests included and adequate?

### Review Guidelines
- **Constructive Feedback**: Provide helpful feedback
- **Code Examples**: Show better alternatives
- **Documentation**: Check for adequate documentation
- **Standards Compliance**: Ensure standards are followed

## Deployment Standards

### Environment Management
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment
- **Configuration**: Environment-specific configurations

### Release Process
- **Version Tagging**: Use semantic versioning
- **Release Notes**: Document changes in releases
- **Database Migrations**: Test migrations thoroughly
- **Rollback Plan**: Have rollback procedures ready

### Monitoring
- **Application Logs**: Structured logging
- **Performance Metrics**: Monitor key metrics
- **Error Tracking**: Track and alert on errors
- **Health Checks**: Implement health check endpoints

## Quality Assurance

### Code Quality Metrics
- **Test Coverage**: Maintain high test coverage
- **Code Duplication**: Minimize code duplication
- **Complexity**: Keep cyclomatic complexity low
- **Dependencies**: Keep dependencies up to date

### Continuous Improvement
- **Regular Reviews**: Regular code and process reviews
- **Refactoring**: Continuous refactoring for improvement
- **Learning**: Stay updated with best practices
- **Documentation**: Keep documentation current

## Compliance & Best Practices

### Legal Compliance
- **Data Privacy**: Comply with data privacy regulations
- **License Compliance**: Ensure proper software licensing
- **Security Standards**: Follow security best practices
- **Audit Trail**: Maintain audit trails for sensitive operations

### Team Collaboration
- **Communication**: Clear and frequent communication
- **Knowledge Sharing**: Share knowledge across team
- **Code Ownership**: Collective code ownership
- **Mentoring**: Support junior developers