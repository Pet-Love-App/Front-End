API 协议约定（前端侧）

- 基础路径：/api/forum
- 发帖：POST /posts/  multipart/form-data，字段：
  - content: string
  - media: File[] 可多次追加
- 广场列表：GET /posts/?page=&page_size=
- 我的收藏：GET /favorites/?page=&page_size=
- 点赞帖子：POST /posts/{id}/like/
- 收藏/取消收藏：POST /posts/{id}/favorite/
- 帖子评论（按赞）：GET /posts/{id}/comments/?ordering=-likes
- 消息中心：GET /messages/?page=&page_size=
- 标记消息已读：POST /messages/{id}/read/
