# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name = "backend-deployment"
    labels = {
      app = "educommunity-backend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "educommunity-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "educommunity-backend"
        }
      }

      spec {
        # ربط الـ Secret لتمكين سحب الصور الخاصة
        image_pull_secrets {
          name = "regcred"
        }

        container {
          name  = "backend"
          image = "faredmansour20/backendend-app:v1" # تأكد من اسم الصورة على Docker Hub

          port {
            container_port = 5000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.app_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.app_secret.metadata[0].name
            }
          }
        }
      }
    }
  }
}

# Backend Service
resource "kubernetes_service" "backend_service" {
  metadata {
    name = "backend-service"
  }

  spec {
    selector = {
      app = "educommunity-backend"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name = "frontend-deployment"
    labels = {
      app = "educommunity-frontend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "educommunity-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "educommunity-frontend"
        }
      }

      spec {
        # ربط الـ Secret لتمكين سحب الصور الخاصة
        image_pull_secrets {
          name = "regcred"
        }

        container {
          name  = "frontend"
          image = "faredmansour20/frontend-app:v1"

          port {
            container_port = 80
          }
        }
      }
    }
  }
}

# Frontend Service (Exposed to Browser)
resource "kubernetes_service" "frontend_service" {
  metadata {
    name = "frontend-service"
  }

  spec {
    selector = {
      app = "educommunity-frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = 30080
    }

    type = "NodePort"
  }
}