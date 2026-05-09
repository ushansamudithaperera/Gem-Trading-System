#!/bin/bash

# Project root
PROJECT_ROOT="Gem Trading System"
mkdir -p $PROJECT_ROOT
cd $PROJECT_ROOT

# Create GitHub workflows
mkdir -p .github/workflows
touch .github/workflows/{ci.yml,cd-backend.yml,cd-frontend.yml}

# Backend structure
mkdir -p backend/src/{config,models,controllers,services,middleware,routes/v1,sockets,utils/validators,types}
mkdir -p backend/tests/{unit/{services,utils},integration/api}
mkdir -p backend/logs
touch backend/.env.example backend/.env.test backend/Dockerfile backend/.dockerignore
touch backend/package.json backend/tsconfig.json backend/jest.config.js backend/swagger.yaml
touch backend/src/app.ts backend/src/server.ts
touch backend/src/config/{database.ts,redis.ts,socket.ts,logger.ts,env.ts}
touch backend/src/models/{User.model.ts,Gem.model.ts,Order.model.ts,CuttingJob.model.ts,Dispute.model.ts,Notification.model.ts}
touch backend/src/controllers/{auth.controller.ts,user.controller.ts,gem.controller.ts,order.controller.ts,escrow.controller.ts,cutting.controller.ts,dispute.controller.ts,notification.controller.ts,health.controller.ts,webhook.controller.ts}
touch backend/src/services/{escrow.service.ts,courier.service.ts,email.service.ts,notification.service.ts,payment.service.ts,ai.client.ts}
touch backend/src/middleware/{auth.middleware.ts,role.middleware.ts,validation.middleware.ts,error.middleware.ts,logging.middleware.ts}
touch backend/src/routes/v1/{auth.routes.ts,user.routes.ts,gem.routes.ts,order.routes.ts,cutting.routes.ts,dispute.routes.ts,health.routes.ts,webhook.routes.ts}
touch backend/src/sockets/{index.ts,events.ts}
touch backend/src/utils/{ApiError.ts,ApiResponse.ts,asyncHandler.ts,generateToken.ts,timerScheduler.ts}
touch backend/src/utils/validators/{user.validator.ts,order.validator.ts}
touch backend/src/types/{user.types.ts,gem.types.ts,order.types.ts,express.d.ts}
touch backend/tests/setup.ts
touch backend/tests/unit/services/escrow.service.test.ts
touch backend/tests/unit/utils/timerScheduler.test.ts
touch backend/tests/integration/api/{gem.test.ts,order.test.ts}

# Frontend structure
mkdir -p frontend/src/{components/{ui,layout,marketplace,serviceHub,orders,notifications,common},pages/{Dashboard,Marketplace,ServiceHub,Orders,Disputes,Auth},hooks,services,store/slices,types,utils}
mkdir -p frontend/tests/{components,hooks}
touch frontend/.env.example frontend/.env.test frontend/Dockerfile frontend/.dockerignore
touch frontend/index.html frontend/package.json frontend/vite.config.ts frontend/tailwind.config.js frontend/tsconfig.json frontend/vitest.config.ts
touch frontend/src/App.tsx frontend/src/main.tsx frontend/src/index.css
# UI components
touch frontend/src/components/ui/{Button.tsx,Card.tsx,Badge.tsx,Toast.tsx}
touch frontend/src/components/layout/{Header.tsx,Sidebar.tsx,MobileNav.tsx}
touch frontend/src/components/marketplace/{GemCard.tsx,GemFilters.tsx,BidModal.tsx}
touch frontend/src/components/serviceHub/{CutterProfile.tsx,CuttingProgress.tsx,HireCutterForm.tsx}
touch frontend/src/components/orders/{OrderTimeline.tsx,EscrowStatus.tsx,DisputeForm.tsx}
touch frontend/src/components/notifications/NotificationBell.tsx
touch frontend/src/components/common/{LoadingSpinner.tsx,ErrorBoundary.tsx,PrivateRoute.tsx}
# Pages
touch frontend/src/pages/Dashboard/{BuyerDashboard.tsx,SellerDashboard.tsx,CutterDashboard.tsx,AdminDashboard.tsx}
touch frontend/src/pages/Marketplace/{MarketplaceList.tsx,GemDetails.tsx}
touch frontend/src/pages/ServiceHub/{CutterList.tsx,CuttingJobs.tsx}
touch frontend/src/pages/Orders/{MyOrders.tsx,OrderDetails.tsx}
touch frontend/src/pages/Disputes/DisputeCenter.tsx
touch frontend/src/pages/Auth/{Login.tsx,Register.tsx}
touch frontend/src/pages/NotFound.tsx
# Hooks & Services & Store
touch frontend/src/hooks/{useAuth.ts,useSocket.ts,useEscrowTimer.ts,useNotification.ts}
touch frontend/src/services/{api.ts,auth.service.ts,gem.service.ts,order.service.ts,cutting.service.ts,notification.service.ts}
touch frontend/src/store/index.ts
touch frontend/src/store/slices/{authSlice.ts,gemSlice.ts,orderSlice.ts,notificationSlice.ts,uiSlice.ts}
touch frontend/src/types/{user.types.ts,gem.types.ts,order.types.ts}
touch frontend/src/utils/{formatDate.ts,roleChecker.ts,socketEvents.ts}
# Tests
touch frontend/tests/components/GemCard.test.tsx
touch frontend/tests/hooks/useAuth.test.ts
touch frontend/tests/setup.ts

# AI service (optional)
mkdir -p ai-service/app ai-service/tests
touch ai-service/Dockerfile ai-service/requirements.txt ai-service/.env.example
touch ai-service/app/{__init__.py,main.py,gem_classifier.py,price_predictor.py}
touch ai-service/tests/test_classifier.py

# Root files
touch docker-compose.yml README.md .gitignore

echo "✅ Full project structure created at: $PROJECT_ROOT"