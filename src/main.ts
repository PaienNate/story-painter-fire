import { createApp,ref } from "vue";
import App from "./App.vue";

import "~/styles/index.scss";
import './str.polyfill.ts'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { createPinia } from 'pinia'
// import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { type GlobalThemeOverrides } from 'naive-ui'
import { generate } from '@ant-design/colors'

const themeOverrides = ref<GlobalThemeOverrides>({})

function setThemeOverrides() {
    var generateColors = generate('#52c41a')
    const commonColors = {
      primaryColor: generateColors[5],
      primaryColorHover: generateColors[4],
      primaryColorSuppl: generateColors[4],
      primaryColorPressed: generateColors[6]
    }
    themeOverrides.common = commonColors
  }


const app = createApp(App);
app.use(createPinia())
// app.component('DynamicScroller', DynamicScroller);
// app.component('DynamicScrollerItem', DynamicScrollerItem);
// app.component('RecycleScroller', RecycleScroller);
// app.use(ElementPlus);
app.mount("#app");
setThemeOverrides();
