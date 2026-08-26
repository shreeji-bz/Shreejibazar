# State Management

## GetX Controllers
Each feature has a controller extending GetxController.
State is managed via .obs reactive variables.

## Example
```dart
class HomeController extends GetxController {
  var isLoading = false.obs;
  var banners = <BannerEntity>[].obs;
}
```
