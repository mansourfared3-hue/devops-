# ConfigMap لبيانات الإعدادات العامة
resource "kubernetes_config_map" "app_config" {
  metadata {
    name = "educommunity-config"
  }

  data = {
    NODE_ENV = "production"
    PORT     = "5000"
  }
}

# Secret للمعلومات الحساسة (باستخدام string_data للتشفير التلقائي)
resource "kubernetes_secret" "app_secret" {
  metadata {
    name = "educommunity-secret"
  }

  # string_data بتخليك تكتب النصوص عادية وTerraform يحولها لـ Base64 لـ Kubernetes تلقائياً
data = {
JWT_SECRET  = "educommunity_jwt_secret_key_2026"
MONGODB_URI = "mongodb://mongo-service:27017/educommunity"
  }

  type = "Opaque"
}