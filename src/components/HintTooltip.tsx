import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { TooltipArrow } from '@radix-ui/react-tooltip'
import type { Ps } from '@/data/types/ps'

interface Props {
  activePs: Ps
  resName: string
}

/** Подсказка с названием РЭС для перетаскиваемой подстанции. */
export const HintTooltip = ({ activePs, resName }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger className="fill-blue-600 text-3xl font-bold text-white bg-teal-600 px-4 py-3">
        Подсказка для {activePs.name}
      </TooltipTrigger>
      <TooltipContent className="text-xl text-white bg-blue-600 fill-blue-600 px-4 py-3">
        <p>{resName}</p>
        <TooltipArrow className="fill-blue-600" />
      </TooltipContent>
    </Tooltip>
  )
}
