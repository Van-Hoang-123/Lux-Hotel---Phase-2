# Git Workflow

## Branches

- `main`: branch ổn định, chỉ merge qua Pull Request.
- `feature/<ten-chuc-nang>`: branch làm từng chức năng.

## Rules

- Không commit trực tiếp lên `main`.
- Luôn tạo branch từ `main` mới nhất.
- Mỗi PR phải có mô tả và cách test.
- PR cần ít nhất 1 người review trước khi merge.

## Example

```bash
git checkout main
git pull origin main
git checkout -b feature/room-api
git add .
git commit -m "Add room API endpoints"
git push origin feature/room-api