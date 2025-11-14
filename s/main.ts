import posthog from 'posthog-js'
import {register_to_dom, html, Nexus} from "@benev/slate"
import {ConstructEditor, single_panel_layout} from "@benev/construct/x/mini.js"

import {Tooltip} from './views/tooltip/view.js'
import {HashRouter} from './tools/hash-router.js'
import {TestEnvAlert} from './views/test-env-alert.js'
import exportSvg from './icons/gravity-ui/export.svg.js'
import {ShortcutsManager} from './views/shortcuts/view.js'
import {TextPanel} from "./components/omni-text/panel.js"
import {AnimPanel} from "./components/omni-anim/panel.js"
import {MediaPanel} from "./components/omni-media/panel.js"
import {OmniText} from "./components/omni-text/component.js"
import {OmniAnim} from "./components/omni-anim/component.js"
import {OmniMedia} from "./components/omni-media/component.js"
import {FiltersPanel} from './components/omni-filters/panel.js'
import {TimelinePanel} from "./components/omni-timeline/panel.js"
import {OmniManager} from './components/omni-manager/component.js'
import {OmniFilters} from './components/omni-filters/component.js'
import {CollaborationManager} from './views/collaboration/view.js'
import {OmniTimeline} from "./components/omni-timeline/component.js"
import {ProjectSettingsPanel} from "./views/project-settings/panel.js"
import {TransitionsPanel} from "./components/omni-transitions/panel.js"
import {omnislate, OmniContext, collaboration} from "./context/context.js"
import {OmniTransitions} from "./components/omni-transitions/component.js"
import {ExportPanel} from "./components/omni-timeline/views/export/panel.js"
import {MediaPlayerPanel} from "./components/omni-timeline/views/media-player/panel.js"
import {ExportConfirmModal, ExportInProgressOverlay} from './components/omni-timeline/views/export/view.js'
import {generate_id} from "@benev/slate/x/tools/generate_id.js";
import {Video, VideoFile} from "./components/omni-media/types";
import {quick_hash} from "@benev/construct";

posthog.init('phc_CMbHMWGVJSqM1RqGyGxWCyqgaSGbGFKl964fIN3NDwU',
	{
			api_host: 'https://eu.i.posthog.com',
			person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
			autocapture: false
	}
)

const IS_TEST_ENV = window.location.hostname.startsWith("test")

export function setupContext(projectId: string) {
	omnislate.context = new OmniContext({
		projectId,
		panels: {
			TimelinePanel,
			MediaPanel,
			MediaPlayerPanel,
			TextPanel,
			ExportPanel,
			ProjectSettingsPanel,
			AnimPanel,
			FiltersPanel,
			TransitionsPanel
		},
		layouts: {
			empty: single_panel_layout("TimelinePanel"),
			default: single_panel_layout("TimelinePanel"),
		},
	})
	return omnislate
}

register_to_dom({OmniManager})
let registered = false

export function removeLoadingPageIndicator() {
	const loadingPageIndicatorElement = document.querySelector(".loading-page-indicator")
	if(loadingPageIndicatorElement)
		document.body.removeChild(loadingPageIndicatorElement!)
}

const VideoEditor =  (omnislate: Nexus<OmniContext>) => omnislate.light_view((use) => () => {
	use.watch(() => use.context.state)

	use.mount(() => {
		const dispose = collaboration.onChange(() => use.rerender())
		return () => dispose()
	})

	const [showConfirmExportModal, setShowConfirmExportModal] = use.state(false)
	const isClient = collaboration.client

	return html`
		<div class=editor>
			${IS_TEST_ENV ? TestEnvAlert : null}
			${ExportConfirmModal([showConfirmExportModal, setShowConfirmExportModal])}
			${ExportInProgressOverlay([])}
			<div class=editor-header>
				<div class="export">
					${CollaborationManager([])}
					${ShortcutsManager([])}
					${Tooltip(
						html`
						<button
							?disabled=${use.context.state.settings.bitrate <= 0 || isClient}
							class="export-button"
							@click=${() => setShowConfirmExportModal(true)}
						>
							<span class="text">${exportSvg}<span>Export</span></span>
						</button>`,
						html`${isClient ?  "Only host can export" : null}`,
						"",
						"bottom-end"
					)}
				</div>
			</div>
			<construct-editor></construct-editor>
		</div>
	`
})

window.location.hash = `/editor/${generate_id()}`
const router = new HashRouter({
	'/editor/*': (projectId) => {
		if(!collaboration.initiatingProject) {
			collaboration.disconnect()
		}
		if(!registered) {
			register_to_dom({OmniTimeline, OmniText, OmniMedia, ConstructEditor, OmniFilters, OmniTransitions, OmniAnim})
			registered = true
		}
		const omnislate = setupContext(projectId)

        const preloadVideo = async () => {
            try {
                const url = "https://cdn.pixabay.com/video/2025/10/31/313145_large.mp4"
                const response = await fetch(url)
                const blob = await response.blob()

                const file = new File([blob], "video.mp4", { type: blob.type })

                const media = omnislate.context.controllers.media

                const hash = await quick_hash(file)

                await media.import_file(file, hash)

                const mediaEntry = media.get(hash)

                const el = document.createElement("video")
                el.src = URL.createObjectURL(mediaEntry.file)
                el.load()

                const thumbnail = await media.create_video_thumbnail(el)

                const video: Video = {
                    element: el,
                    file: mediaEntry.file,
                    hash: mediaEntry.hash,
                    kind: "video",
                    frames: mediaEntry.frames,
                    fps: mediaEntry,
                    duration: mediaEntry.duration,
                    proxy: mediaEntry.proxy,
                    thumbnail
                }

                const managers = omnislate.context.controllers.compositor.managers
                managers.videoManager.create_and_add_video_effect(video, omnislate.context.state)

            } catch (err) {
                console.error("preloadVideo failed:", err)
            }
        }


        void preloadVideo()



        return html`${VideoEditor(omnislate)()}`
	},
})

document.body.append(router.element)
document.documentElement.className = "sl-theme-dark"
//@ts-ignore
