
import { defineStore } from 'pinia'
import { EditorView } from '@codemirror/view';
import axios from 'axios';
import { CharItem, LogItem, packNameId } from './logManager/types';
import { random } from 'lodash-es';
import * as twColors from 'tailwindcss/colors';

export const useStore = defineStore('main', {
  state: () => {
    return {
      index: 0,
      editor: null as any as EditorView,
      pcList: [] as CharItem[],
      pcNameColorMap: new Map<string, string>(), // 只以名字记录
      palette: [twColors.pink['600'], twColors.orange['600'], twColors.pink['400'], twColors.purple['400'], twColors.sky['600'], twColors.slate['400'], twColors.gray['600']],
      paletteStack: [] as string[],
      items: [] as LogItem[],
      doEditorHighlight: false,

      // 仅用于论坛代码
      randomBBSColorNames: ["skyblue", "royalblue", "darkblue", "orangered", "red", "firebrick", "darkred", "green", "limegreen", "seagreen", "tomato", "coral", "indigo", "burlywood", "sandybrown", "chocolate"],
      randomBBSColorNamesMap: new Map<string, string>(),

      bbsUseSpaceWithMultiLine: false,
      bbsUseColorName: false,

      trgIsAddVoiceMark: false,

      previewElement: HTMLElement,
      _reloadEditor: null as any as (highlight: boolean) => void,

      exportOptions: {
        commandHide: false,
        imageHide: false,
        offTopicHide: false,
        timeHide: false,
        userIdHide: true,
        yearHide: true,
        textIndentAll: false,
        textIndentFirst: true,
      }
    }
  },
  getters: {
    pcMap() {
      let m = new Map<string, CharItem>();
      for (let i of this.pcList) {
        m.set(packNameId(i), i);
      }
      return m;
    }
  },
  actions: {
    colorHexToName(color: string) {
      // nga全部可用颜色
      // "skyblue", "royalblue", "blue", "darkblue", "orange", "orangered", "crimson", "red", "firebrick", "darkred", "green", "limegreen", "seagreen", "teal", "deeppink", "tomato", "coral", "purple", "indigo", "burlywood", "sandybrown", "sienna", "chocolate", "silver"
      switch (color) {
        case twColors.amber['600']:
          // 深棕色
          return 'sienna';
        case twColors.pink['600']:
          // 深粉色，没有类似的，用深红色替代了
          return 'crimson';
        case twColors.orange['600']:
          // 棕色 / 橙色
          return 'orange';
        case twColors.pink['400']:
          // 淡粉色
          return 'deeppink';
        case twColors.purple['400']:
          // 紫色
          return 'purple';
        case twColors.sky['600']:
          // 靛蓝色
          return 'blue';
        case twColors.slate['400']:
          // 青绿色
          return 'teal';
        case twColors.gray['600']: case twColors.gray['400']:
          // 深灰色
          return 'silver';
      }

      if (this.randomBBSColorNamesMap.get(color)) {
        return this.randomBBSColorNamesMap.get(color)
      }

      if (this.randomBBSColorNames.length === 0) {
        return 'red';
      }

      const randomIndex = random(0, this.randomBBSColorNames.length - 1);
      const colorName = this.randomBBSColorNames.splice(randomIndex, 1)[0];

      this.randomBBSColorNamesMap.set(color, colorName);
      return colorName;
    },
    
    reloadEditor () {
      this._reloadEditor(this.doEditorHighlight)
    },

    colorMapSave() {
      localStorage.setItem('pcNameColorMap', JSON.stringify([...this.pcNameColorMap]))
    },

    colorMapLoad() {
      const lst = JSON.parse(localStorage.getItem('pcNameColorMap') || '[]');
      this.pcNameColorMap = new Map(lst)
    },

    getColor(): string {
      if (this.paletteStack.length === 0) {
        this.paletteStack = [...this.palette]
      }
      return this.paletteStack.shift() as string
    },

    async tryFetchLog(key: string, password: string) {
      // https://weizaima.com/dice
      const resp = await axios.get('https://newseal.firehomework.top/dice/api/load_data', {
        params: { key, password }
      })
      return resp.data
    },

    /** 移除不使用的pc名字 */
    async pcNameRefresh() {
      const names = new Set();
      const namesAll = new Set();
      const namesToDelete = new Set();
    
      for (let i of this.pcList) {
        namesAll.add(i.name)
      }
    
      for (let i of this.items) {
        names.add(i.nickname)
      }
    
      for (let i of namesAll) {
        if (!names.has(i)) {
          namesToDelete.add(i)
        }
      }
    
      for (let i of namesToDelete) {
        this.tryRemovePC(i as any)
      }
    },

    /** 更新pc列表 */
    async updatePcList(charInfo: Map<string, CharItem>) {
      const exists = new Set();
      for (let i of this.pcList) {
        exists.add(packNameId(i));
      }
    
      for (let [k, v] of charInfo) {
        const id = packNameId(v);
        if (!exists.has(id)) {
          let c = this.pcNameColorMap.get(v.name);
          if (!c) {
            c = this.getColor();
            this.pcNameColorMap.set(v.name, c);
            this.colorMapSave()
          }
          v.color = c;
          this.pcList.push(v);
          exists.add(id);
        }
      }
    },

    async tryRemovePC(name: string) {
      let index = 0
      for (let i of this.pcList) {
        if (i.name === name) {
          this.pcList.splice(index, 1)
          break
        }
        index += 1
      }
    },
  }
})
