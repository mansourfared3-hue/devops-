# ConfigMap لبيانات الإعدادات
resource "kubernetes_config_map" "app_config" {
  metadata {
    name = "educommunity-config"
  }

  data = {
    NODE_ENV = "production"
    PORT     = "5000"
  }
}

# Secret للمعلومات الحساسة
resource "kubernetes_secret" "app_secret" {
  metadata {
    name = "educommunity-secret"
  }

  data = {
    JWT_SECRET  = "educommunity_jwt_secret_key_2026"
    MONGODB_URI = "mongodb://mongo-service:27017/educommunity"
  }

  type = "Opaque"
}