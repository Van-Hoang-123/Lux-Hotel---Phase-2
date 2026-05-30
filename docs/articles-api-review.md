# Articles API Review

Branch: `feature/articles-api`

Review date: 2026-05-29

## Verification

- `dotnet build src/LuxHotel.Api/LuxHotel.Api.csproj --no-restore`: passed.
- `dotnet test LuxHotel.sln`: failed because `tests/LuxHotel.Tests/Validators/BookingValidatorTests.cs` references missing `BookingValidator`; this is not caused by Articles API code.
- `dotnet ef database update --project src/LuxHotel.Infrastructure/LuxHotel.Infrastructure.csproj --startup-project src/LuxHotel.Api/LuxHotel.Api.csproj --context LuxHotelDbContext`: passed; database was already up to date.

## Runtime Checks

Tested against local API on `http://localhost:5098` with LocalDB.

| Endpoint | Expected | Result |
| --- | --- | --- |
| `GET /api/articles/getAll` | List articles | `200 OK` |
| `GET /api/articles/pagination?pageNumber=1&pageSize=2` | Paged articles | `200 OK` |
| `GET /api/articles/getById/999999` | Missing article | `404 Not Found` |
| `GET /api/articles/getByCategory/Daily` | Valid category filter | `200 OK` |
| `GET /api/articles/getByCategory/Invalid` | Invalid category | `400 Bad Request` |
| `GET /api/articles/getByTitle/test` | Title filter | `200 OK` |
| `POST /api/articles` without token | Protected endpoint | `401 Unauthorized` |
| `PUT /api/articles/edit/{id}` without token | Protected endpoint | `401 Unauthorized` |
| `DELETE /api/articles/delete/{id}` without token | Protected endpoint | `401 Unauthorized` |
| `POST /api/articles` with `Admin` token | Create article | `200 OK` |
| `GET /api/articles/getById/{createdId}` | Read created article | `200 OK` |
| `PUT /api/articles/edit/{createdId}` with `Admin` token | Update article | `200 OK` |
| `DELETE /api/articles/delete/{createdId}` with `Admin` token | Delete article | `200 OK` |

## Findings

### High Priority

- `PUT /api/articles/edit/{id}` can assign `null` to required entity fields. `ArticleEditRequest` marks `Title`, `Category`, `Summary`, and `Content` nullable, but the controller assigns them directly to required `Article` properties. A partial update body such as `{ "title": "Only title" }` can clear required fields and may cause save failures or invalid data.

### Medium Priority

- `POST /api/articles` returns `200 OK` after creating a resource. Prefer `201 Created` with `CreatedAtAction` or `CreatedAtRoute` so clients can discover the new article URL.
- Article routes are action-style instead of resource-style. Current routes such as `/getAll`, `/getById/{id}`, `/edit/{id}`, and `/delete/{id}` work, but a REST-style shape would be easier for frontend and API consumers: `GET /api/articles`, `GET /api/articles/{id}`, `POST /api/articles`, `PUT /api/articles/{id}`, `DELETE /api/articles/{id}`.
- Category filtering is case-sensitive. `/api/articles/getByCategory/blog` fails even though `Blog` is valid. Normalize category input or use a case-insensitive comparison.

### Low Priority

- `ArticlesController` uses `LuxHotelDbContext` directly. This is acceptable for a small feature, but if the project is moving toward repository/service boundaries, Articles should follow the same pattern for consistency.
- There are unused imports in `ArticlesController`, including `Azure.Core`.
- Some response messages are inconsistent, for example `"category not found"` for a missing category parameter and `"Inavailable category name"` for an invalid value.

## Recommendation

The Articles API is functional and the main endpoints work. Before merging, fix the nullable edit behavior first. After that, consider normalizing routes and response codes so the API is easier to consume and maintain.
