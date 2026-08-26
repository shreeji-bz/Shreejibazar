import 'package:get/get.dart';
import '../../domain/usecases/get_home_data.dart';

class HomeController extends GetxController {
  final GetHomeData getHomeData;
  HomeController(this.getHomeData);

  var isLoading = false.obs;
  var errorMessage = ''.obs;

  Future<void> loadHomeData() async {
    isLoading.value = true;
    try {
      await getHomeData();
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }
}
