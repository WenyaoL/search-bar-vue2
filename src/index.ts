import Vue, { VueConstructor } from "vue";
import SearchBar from "./components/searchBar.vue";

const install = (Vue: VueConstructor, options: any) => {
  Vue.component("SearchBar", SearchBar);
};

export default { install, SearchBar };

export { install, SearchBar };
