---
name: deep-debug
description: Deep bug investigation workflow for hard-to-trace errors. Systematic root cause analysis — no guessing, no blind fixes. Use when user says "deep debug", "deep-debug", "trace bug", "find root cause", "hard bug", "investigate bug".
---

# Deep Bug Investigation Workflow

Dành cho bug khó, fix nhiều lần không được. KHÔNG đoán mò — trace từng bước đến root cause.

## Step 1: Thu thập evidence

Ghi lại chính xác, KHÔNG diễn giải:

- Error message nguyên văn
- Stack trace: file, line number, call chain
- Environment nào bị (production/staging/local)
- Lỗi mọi lúc hay chỉ một số case

## Step 2: Verify code đang chạy

KHÔNG giả định code trên production = code trên local.

- Xác định chính xác version/commit đang deploy
- So sánh với code đang đọc trên local
- Nếu KHÁC NHAU → đọc đúng version đang deploy trước khi phân tích tiếp

## Step 3: Trace execution path

Đây là bước quan trọng nhất. Đi từ entry point → đến dòng lỗi. Trace TỪNG bước, KHÔNG nhảy cóc.

### 3a. Entry point → Error line

- Request/event/job đi vào từ đâu?
- Function nào gọi function nào? Theo đúng stack trace.
- Data được truyền qua các layer thế nào?

### 3b. Data ở dòng lỗi đến từ đâu?

- Biến bị lỗi được tạo/load từ đâu?
- Load trực tiếp từ source (DB, API) hay từ cache/session?
- Có qua serialize → unserialize không?
- Có qua transform/convert nào không?

### 3c. Type & state tại thời điểm lỗi

- Type thực tế của biến là gì? (string, object, null, enum...)
- Code expect type gì?
- Tại sao type thực tế khác type expected?

### 3d. Framework internals (khi lỗi trong vendor/library)

- Đọc source code tại ĐÚNG line number từ stack trace
- Trace ngược: ai gọi method đó, với argument gì
- Điều kiện nào khiến code đi vào branch gây lỗi

## Step 4: Tìm root cause — Trả lời 3 câu

1. **Tại sao lỗi?** — Nguyên nhân kỹ thuật cụ thể
2. **Tại sao trước đây không lỗi?** — Cái gì thay đổi
3. **Điều kiện reproduce?** — Khi nào lỗi, khi nào không

Nếu chưa trả lời được cả 3 → quay lại Step 3, trace thêm.

## Step 5: Check các nguồn state ẩn

Bug "lúc được lúc không" thường do state ẩn. Check theo thứ tự:

### Cache / Serialization

- Object lấy từ cache có mất internal state không? (transient fields, lazy-loaded properties, runtime caches)
- Cache cũ chứa data format cũ, code mới expect format mới?
- Serialize/unserialize có thay đổi type không? (int↔float, null handling, enum↔string)

### Database / Storage

- Collation, encoding có ảnh hưởng comparison không?
- Default value trong DB có match code expectation không?
- Schema đã update trên production chưa?

### Runtime cache / Compiled cache

- Có compiled/cached config, routes, views chưa clear?
- Bytecode cache (OPcache, compiled assets) có serve file cũ?
- CDN/proxy cache serve asset cũ?

### Environment

- Env vars trên production có đúng/đủ không?
- Version runtime (PHP, Node, Go, Python, etc.) có khác local không?
- Dependency version có khác không?

## Step 6: Fix

Chỉ fix khi đã trả lời được 3 câu ở Step 4. Fix phải:

- Xử lý đúng root cause, không phải symptom
- Handle edge case đã phát hiện (cache stale, type mismatch)
- Defensive ở data boundary (cache, DB, external API) — không ở internal logic
- Không phá code path bình thường để fix edge case

## Step 7: Verify

- Reproduce điều kiện lỗi từ Step 4 → confirm đã fix
- Test code path bình thường vẫn hoạt động
- Nếu liên quan cache → test cả fresh load lẫn cached load
- Verify đúng version đã deploy (lặp lại Step 2)

## IMPORTANT

- **KHÔNG ĐOÁN MÒ** — Trace evidence, không suy luận từ tên biến hay "có lẽ là..."
- **KHÔNG FIX TRƯỚC KHI HIỂU** — Fix mà không hiểu root cause = tạo bug mới
- **VERIFY DEPLOYED CODE** — Luôn check version đang chạy, không giả định production = local
- **CHECK CACHE TRƯỚC** — Phần lớn bug "lúc được lúc không" là do stale cached state
- **MỘT ROOT CAUSE** — Mỗi bug chỉ có 1 root cause. Nếu còn nhiều khả năng → trace thêm
