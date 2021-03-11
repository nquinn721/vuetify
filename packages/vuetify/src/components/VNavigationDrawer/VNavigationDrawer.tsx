// Styles
import './VNavigationDrawer.sass'

// Composables
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeBorderRadiusProps, useBorderRadius } from '@/composables/border-radius'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'
import { makePositionProps, usePosition } from '@/composables/position'
import { useProxiedModel } from '@/composables/proxiedModel'
import { useTheme } from '@/composables/theme'

// Utilities
import { computed, defineComponent, onBeforeMount, ref, toRef } from 'vue'
import { convertToUnit } from '@/util/helpers'
import { makeTagProps } from '@/composables/tag'
import makeProps from '@/util/makeProps'

// Types
import type { PropType } from 'vue'

const alignedValues = ['start', 'center', 'end'] as const
type Alignment = typeof alignedValues[number]

export default defineComponent({
  name: 'VNavigationDrawer',

  props: makeProps({
    ...makeBorderProps(),
    ...makeBorderRadiusProps(),
    ...makeDimensionProps({ width: 256 }),
    ...makeElevationProps(),
    ...makeLayoutItemProps({ name: 'navigation-drawer' }),
    ...makePositionProps(),
    ...makeTagProps({ tag: 'nav' }),
    aligned: {
      type: String as PropType<Alignment>,
      default: 'start',
      validator: (v: any) => alignedValues.includes(v),
    },
    expandOnHover: Boolean,
    floating: Boolean,
    mobile: Boolean,
    modelValue: Boolean,
    permanent: Boolean,
    rail: Boolean,
    railWidth: {
      type: [Number, String],
      default: 72,
    },
    src: String,
    stateless: Boolean,
    temporary: Boolean,
  }),

  setup (props, { slots }) {
    const { themeClasses } = useTheme()
    const { borderClasses } = useBorder(props, 'v-navigation-drawer')
    const { borderRadiusClasses } = useBorderRadius(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { positionClasses, positionStyles } = usePosition(props, 'v-navigation-drawer')

    const isActive = useProxiedModel(props, 'modelValue')
    const isHovering = ref(false)
    const isStateful = computed(() => props.permanent || props.stateless)
    const size = computed(() => Number(props.rail ? props.railWidth : props.width))
    const width = computed(() => {
      return (props.rail && props.expandOnHover && isHovering.value)
        ? props.width
        : size.value
    })
    const styles = useLayoutItem(
      props.name,
      toRef(props, 'priority'),
      computed(() => props.right ? 'right' : 'left'),
      computed(() => {
        return (
          isStateful.value ||
          (isActive.value && !props.temporary)
        ) ? size.value : 0
      }),
    )

    onBeforeMount(() => {
      if (isActive.value == null) isActive.value = !props.mobile
    })

    return () => {
      const hasImg = (slots.img || props.src)
      const translate = (
        (isStateful.value || isActive.value ? 0 : 100) * (!props.right && !props.bottom ? -1 : 1)
      )

      return (
        <props.tag
          onMouseenter={ () => (isHovering.value = true) }
          onMouseleave={ () => (isHovering.value = false) }
          class={[
            'v-navigation-drawer',
            {
              [`v-navigation-drawer--aligned-${props.aligned}`]: !!props.aligned,
              'v-navigation-drawer--bottom': props.bottom,
              'v-navigation-drawer--end': props.right,
              'v-navigation-drawer--expand-on-hover': props.expandOnHover,
              'v-navigation-drawer--floating': props.floating,
              'v-navigation-drawer--is-hovering': isHovering.value,
              'v-navigation-drawer--is-mobile': props.mobile,
              'v-navigation-drawer--rail': props.rail,
              'v-navigation-drawer--start': props.left || !props.right,
              'v-navigation-drawer--temporary': props.temporary || props.mobile,
            },
            borderClasses.value,
            borderRadiusClasses.value,
            elevationClasses.value,
            positionClasses.value,
            themeClasses.value,
          ]}
          style={[
            dimensionStyles.value,
            positionStyles.value,
            styles.value,
            {
              transform: `translate${props.bottom ? 'Y' : 'X'}(${convertToUnit(translate, '%')})`,
              width: convertToUnit(width.value),
            },
          ]}
        >
          { hasImg && (
            <div class="v-navigation-drawer__img">
              { slots.img
                ? slots.img?.({ src: props.src })
                : (<img src={ props.src } alt="" />)
              }
            </div>
          )}

          { slots.prepend && (
            <div class="v-navigation-drawer__prepend">
              { slots.prepend?.() }
            </div>
          )}

          <div class="v-navigation-drawer__content">
            { slots.default?.() }
          </div>

          { slots.append && (
            <div class="v-navigation-drawer__append">
              { slots.append?.() }
            </div>
          )}
        </props.tag>
      )
    }
  },
})
