(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Escritorio/v0-project-setup-and-plan/lib/validations/pastor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pastorSchema",
    ()=>pastorSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js [app-client] (ecmascript) <export * as z>");
;
const pastorSchema = __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    nombre: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
    iglesia: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(3, 'El nombre de la iglesia debe tener al menos 3 caracteres').max(100, 'El nombre de la iglesia no puede exceder 100 caracteres'),
    provincia: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'La provincia es requerida'),
    ciudad: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, 'La ciudad debe tener al menos 2 caracteres').max(100, 'La ciudad no puede exceder 100 caracteres'),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'El correo electrónico es requerido').email('Correo electrónico inválido'),
    telefono: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10, 'El teléfono debe tener al menos 10 caracteres').regex(/^\+?[0-9\s\-()]+$/, 'Formato de teléfono inválido'),
    observaciones: __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$76$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional()
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip,
    "TooltipContent",
    ()=>TooltipContent,
    "TooltipProvider",
    ()=>TooltipProvider,
    "TooltipTrigger",
    ()=>TooltipTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$tooltip$40$1$2e$2$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/@radix-ui+react-tooltip@1.2.8_@types+react-dom@19.0.0_@types+react@19.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/@radix-ui/react-tooltip/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const TooltipProvider = __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$tooltip$40$1$2e$2$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"];
const Tooltip = __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$tooltip$40$1$2e$2$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const TooltipTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$tooltip$40$1$2e$2$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const TooltipContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$tooltip$40$1$2e$2$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        ref: ref,
        sideOffset: sideOffset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/tooltip.tsx",
        lineNumber: 18,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = TooltipContent;
TooltipContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$tooltip$40$1$2e$2$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "TooltipContent$React.forwardRef");
__turbopack_context__.k.register(_c1, "TooltipContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$4_$40$types$2b$react$40$19$2e$0$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/@radix-ui+react-slot@1.2.4_@types+react@19.0.0_react@19.2.0/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
            secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
            destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge({ className, variant, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$4_$40$types$2b$react$40$19$2e$0$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'span';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/badge.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/@radix-ui+react-label@2.1.8_@types+react-dom@19.0.0_@types+react@19.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/textarea.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
;
;
function Textarea({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        "data-slot": "textarea",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/textarea.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Textarea;
;
var _c;
__turbopack_context__.k.register(_c, "Textarea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/alert.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Alert",
    ()=>Alert,
    "AlertDescription",
    ()=>AlertDescription,
    "AlertTitle",
    ()=>AlertTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const alertVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current', {
    variants: {
        variant: {
            default: 'bg-card text-card-foreground',
            destructive: 'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Alert({ className, variant, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "alert",
        role: "alert",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(alertVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/alert.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c = Alert;
function AlertTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "alert-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/alert.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_c1 = AlertTitle;
function AlertDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "alert-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/alert.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_c2 = AlertDescription;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Alert");
__turbopack_context__.k.register(_c1, "AlertTitle");
__turbopack_context__.k.register(_c2, "AlertDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectScrollDownButton",
    ()=>SelectScrollDownButton,
    "SelectScrollUpButton",
    ()=>SelectScrollUpButton,
    "SelectSeparator",
    ()=>SelectSeparator,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/@radix-ui+react-select@2.2.6_@types+react-dom@19.0.0_@types+react@19.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/@radix-ui/react-select/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function Select({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "select",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Select;
function SelectGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        "data-slot": "select-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = SelectGroup;
function SelectValue({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Value"], {
        "data-slot": "select-value",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = SelectValue;
function SelectTrigger({ className, size = 'default', children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "select-trigger",
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                    className: "size-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c3 = SelectTrigger;
function SelectContent({ className, children, position = 'popper', ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "select-content",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md', position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', className),
            position: position,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {}, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1'),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {}, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_c4 = SelectContent;
function SelectLabel({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "select-label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground px-2 py-1.5 text-xs', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_c5 = SelectLabel;
function SelectItem({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "select-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute right-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemText"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_c6 = SelectItem;
function SelectSeparator({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        "data-slot": "select-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-border pointer-events-none -mx-1 my-1 h-px', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
_c7 = SelectSeparator;
function SelectScrollUpButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        "data-slot": "select-scroll-up-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex cursor-default items-center justify-center py-1', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__["ChevronUpIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
            lineNumber: 151,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_c8 = SelectScrollUpButton;
function SelectScrollDownButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        "data-slot": "select-scroll-down-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex cursor-default items-center justify-center py-1', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
            lineNumber: 169,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_c9 = SelectScrollDownButton;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Select");
__turbopack_context__.k.register(_c1, "SelectGroup");
__turbopack_context__.k.register(_c2, "SelectValue");
__turbopack_context__.k.register(_c3, "SelectTrigger");
__turbopack_context__.k.register(_c4, "SelectContent");
__turbopack_context__.k.register(_c5, "SelectLabel");
__turbopack_context__.k.register(_c6, "SelectItem");
__turbopack_context__.k.register(_c7, "SelectSeparator");
__turbopack_context__.k.register(_c8, "SelectScrollUpButton");
__turbopack_context__.k.register(_c9, "SelectScrollDownButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/@radix-ui+react-dialog@1.1.15_@types+react-dom@19.0.0_@types+react@19.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as XIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function Dialog({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dialog",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Dialog;
function DialogTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dialog-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = DialogTrigger;
function DialogPortal({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dialog-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = DialogPortal;
function DialogClose({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
        "data-slot": "dialog-close",
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
_c3 = DialogClose;
function DialogOverlay({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        "data-slot": "dialog-overlay",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c4 = DialogOverlay;
function DialogContent({ className, children, showCloseButton = true, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        "data-slot": "dialog-portal",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                "data-slot": "dialog-content",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg', className),
                ...props,
                children: [
                    children,
                    showCloseButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        "data-slot": "dialog-close",
                        className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__["XIcon"], {}, void 0, false, {
                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
                        lineNumber: 70,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c5 = DialogContent;
function DialogHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col gap-2 text-center sm:text-left', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c6 = DialogHeader;
function DialogFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_c7 = DialogFooter;
function DialogTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        "data-slot": "dialog-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-lg leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_c8 = DialogTitle;
function DialogDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15_$40$types$2b$react$2d$dom$40$19$2e$0$2e$0_$40$types$2b$react$40$19$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        "data-slot": "dialog-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, this);
}
_c9 = DialogDescription;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Dialog");
__turbopack_context__.k.register(_c1, "DialogTrigger");
__turbopack_context__.k.register(_c2, "DialogPortal");
__turbopack_context__.k.register(_c3, "DialogClose");
__turbopack_context__.k.register(_c4, "DialogOverlay");
__turbopack_context__.k.register(_c5, "DialogContent");
__turbopack_context__.k.register(_c6, "DialogHeader");
__turbopack_context__.k.register(_c7, "DialogFooter");
__turbopack_context__.k.register(_c8, "DialogTitle");
__turbopack_context__.k.register(_c9, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/components/scroll-reveal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollReveal",
    ()=>ScrollReveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function ScrollReveal({ children, className = '', delay = 0 }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrollReveal.useEffect": ()=>{
            const observer = new IntersectionObserver({
                "ScrollReveal.useEffect": (entries)=>{
                    entries.forEach({
                        "ScrollReveal.useEffect": (entry)=>{
                            if (entry.isIntersecting) {
                                setTimeout({
                                    "ScrollReveal.useEffect": ()=>{
                                        entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-4');
                                        entry.target.classList.remove('opacity-0', 'translate-y-4');
                                    }
                                }["ScrollReveal.useEffect"], delay);
                                observer.unobserve(entry.target);
                            }
                        }
                    }["ScrollReveal.useEffect"]);
                }
            }["ScrollReveal.useEffect"], {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            if (ref.current) {
                observer.observe(ref.current);
            }
            return ({
                "ScrollReveal.useEffect": ()=>{
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            })["ScrollReveal.useEffect"];
        }
    }["ScrollReveal.useEffect"], [
        delay
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: `opacity-0 translate-y-4 transition-all duration-700 ${className}`,
        style: {
            animationDuration: '700ms',
            animationFillMode: 'forwards'
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/components/scroll-reveal.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(ScrollReveal, "8uVE59eA/r6b92xF80p7sH8rXLk=");
_c = ScrollReveal;
var _c;
__turbopack_context__.k.register(_c, "ScrollReveal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PastoresPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$react$2d$hook$2d$form$40$7$2e$66$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/react-hook-form@7.66.1_react@19.2.0/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$hookform$2b$resolvers$40$5$2e$2$2e$2_react$2d$hook$2d$form$40$7$2e$66$2e$1_react$40$19$2e$2$2e$0_$2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/@hookform+resolvers@5.2.2_react-hook-form@7.66.1_react@19.2.0_/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$validations$2f$pastor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/lib/validations/pastor.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/textarea.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/alert.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-client] (ecmascript) <export default as Smartphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/node_modules/.pnpm/lucide-react@0.454.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$scroll$2d$reveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Escritorio/v0-project-setup-and-plan/components/scroll-reveal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const pastores = [
    {
        id: 1,
        nombre: 'Rev. Juan Pérez',
        iglesia: 'Iglesia Central Buenos Aires',
        ciudad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        email: 'juan.perez@iglesia.com',
        telefono: '+54 11 1234-5678',
        estadoPago: 'confirmado',
        monto: 15000,
        cuotasPagadas: 3,
        fecha: '2025-01-15',
        registroOrigen: 'manual'
    },
    {
        id: 2,
        nombre: 'Ptra. María González',
        iglesia: 'Iglesia Nueva Vida',
        ciudad: 'Córdoba',
        provincia: 'Córdoba',
        email: 'maria.gonzalez@iglesia.com',
        telefono: '+54 351 9876-5432',
        estadoPago: 'parcial',
        monto: 15000,
        cuotasPagadas: 2,
        fecha: '2025-01-16',
        registroOrigen: 'mobile'
    },
    {
        id: 3,
        nombre: 'Rev. Carlos Rodríguez',
        iglesia: 'Iglesia Monte Hermoso',
        ciudad: 'Rosario',
        provincia: 'Santa Fe',
        email: 'carlos.rodriguez@iglesia.com',
        telefono: '+54 341 5555-4444',
        estadoPago: 'pendiente',
        monto: 15000,
        cuotasPagadas: 0,
        fecha: '2025-01-17',
        registroOrigen: 'mobile'
    },
    {
        id: 4,
        nombre: 'Ptra. Ana Martínez',
        iglesia: 'Iglesia El Buen Pastor',
        ciudad: 'Mendoza',
        provincia: 'Mendoza',
        email: 'ana.martinez@iglesia.com',
        telefono: '+54 261 7777-8888',
        estadoPago: 'pendiente',
        monto: 15000,
        cuotasPagadas: 0,
        fecha: '2025-01-18',
        registroOrigen: 'manual'
    },
    {
        id: 5,
        nombre: 'Rev. Luis Fernández',
        iglesia: 'Iglesia Roca Eterna',
        ciudad: 'La Plata',
        provincia: 'Buenos Aires',
        email: 'luis.fernandez@iglesia.com',
        telefono: '+54 221 3333-2222',
        estadoPago: 'parcial',
        monto: 15000,
        cuotasPagadas: 1,
        fecha: '2025-01-19',
        registroOrigen: 'mobile'
    }
];
function PastoresPage() {
    _s();
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [estadoFilter, setEstadoFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('todos');
    const [origenFilter, setOrigenFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('todos');
    const [selectedPastor, setSelectedPastor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAddingPastor, setIsAddingPastor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isEditingPastor, setIsEditingPastor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$react$2d$hook$2d$form$40$7$2e$66$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f40$hookform$2b$resolvers$40$5$2e$2$2e$2_react$2d$hook$2d$form$40$7$2e$66$2e$1_react$40$19$2e$2$2e$0_$2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$lib$2f$validations$2f$pastor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pastorSchema"])
    });
    const filteredPastores = pastores.filter((pastor)=>{
        const matchSearch = pastor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || pastor.iglesia.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEstado = estadoFilter === 'todos' || pastor.estadoPago === estadoFilter;
        const matchOrigen = origenFilter === 'todos' || pastor.registroOrigen === origenFilter;
        return matchSearch && matchEstado && matchOrigen;
    });
    const descargarReporte = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].promise(new Promise((resolve)=>setTimeout(resolve, 2000)), {
            loading: 'Generando reporte...',
            success: 'Reporte descargado exitosamente',
            error: 'Error al generar el reporte'
        });
    };
    const onSubmit = async (data)=>{
        /* eslint-disable */ console.log(...oo_oo(`203417171_152_4_152_37_4`, 'Pastor data:', data));
        __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].promise(new Promise((resolve)=>setTimeout(resolve, 1000)), {
            loading: 'Registrando pastor...',
            success: ()=>{
                reset();
                setIsAddingPastor(false);
                return `${data.nombre} registrado exitosamente`;
            },
            error: 'Error al registrar el pastor'
        });
    };
    const handleDelete = (pastor)=>{
        if (confirm(`¿Está seguro de eliminar a ${pastor.nombre}?`)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].promise(new Promise((resolve)=>setTimeout(resolve, 1000)), {
                loading: 'Eliminando pastor...',
                success: `${pastor.nombre} eliminado correctamente`,
                error: 'Error al eliminar el pastor'
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/admin",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        size: "icon",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                        lineNumber: 188,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 187,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-3xl font-bold tracking-tight",
                                            children: "Gestión de Pastores"
                                        }, void 0, false, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 193,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-muted-foreground mt-1",
                                            children: "Registro manual y visualización de pastores inscritos"
                                        }, void 0, false, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 194,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 192,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                            lineNumber: 186,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: isAddingPastor,
                            onOpenChange: setIsAddingPastor,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                    asChild: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "size-4 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                lineNumber: 202,
                                                columnNumber: 15
                                            }, this),
                                            "Registrar Pastor"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                        lineNumber: 201,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 200,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                                    className: "max-w-2xl max-h-[90vh] overflow-y-auto",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                                    children: "Registro Manual de Pastor"
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 208,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                                                    children: "Complete la información para inscribir un nuevo pastor a la convención"
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 209,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 207,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                            className: "space-y-4",
                                            onSubmit: handleSubmit(onSubmit),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid gap-4 md:grid-cols-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "nombre",
                                                                    children: "Nombre completo *"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 216,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "nombre",
                                                                    placeholder: "Rev. Juan Pérez",
                                                                    ...register('nombre')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 217,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.nombre && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 224,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.nombre.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 225,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 223,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "iglesia",
                                                                    children: "Iglesia *"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "iglesia",
                                                                    placeholder: "Iglesia Central",
                                                                    ...register('iglesia')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 231,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.iglesia && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 238,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.iglesia.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 239,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 237,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 229,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "provincia",
                                                                    children: "Provincia *"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 244,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                    onValueChange: (value)=>setValue('provincia', value),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                                placeholder: "Seleccionar provincia"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                lineNumber: 247,
                                                                                columnNumber: 23
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 246,
                                                                            columnNumber: 21
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "buenos-aires",
                                                                                    children: "Buenos Aires"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 250,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "cordoba",
                                                                                    children: "Córdoba"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 251,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "santa-fe",
                                                                                    children: "Santa Fe"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 252,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "mendoza",
                                                                                    children: "Mendoza"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 253,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "tucuman",
                                                                                    children: "Tucumán"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 254,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "salta",
                                                                                    children: "Salta"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 255,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: "entre-rios",
                                                                                    children: "Entre Ríos"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 256,
                                                                                    columnNumber: 23
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 249,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 245,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.provincia && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 261,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.provincia.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 262,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 260,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 243,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "ciudad",
                                                                    children: "Ciudad *"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 267,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "ciudad",
                                                                    placeholder: "Buenos Aires",
                                                                    ...register('ciudad')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 268,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.ciudad && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 275,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.ciudad.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 276,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 274,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 266,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "email",
                                                                    children: "Email *"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 281,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "email",
                                                                    type: "email",
                                                                    placeholder: "pastor@iglesia.com",
                                                                    ...register('email')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 282,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 290,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.email.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 291,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 289,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 280,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "telefono",
                                                                    children: "Teléfono *"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 296,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "telefono",
                                                                    placeholder: "+54 11 1234-5678",
                                                                    ...register('telefono')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 297,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.telefono && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 304,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.telefono.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 305,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 303,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 295,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2 md:col-span-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "observaciones",
                                                                    children: "Observaciones"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 310,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                                                    id: "observaciones",
                                                                    placeholder: "Información adicional...",
                                                                    rows: 3,
                                                                    ...register('observaciones')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 311,
                                                                    columnNumber: 19
                                                                }, this),
                                                                errors.observaciones && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Alert"], {
                                                                    variant: "destructive",
                                                                    className: "py-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "size-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 319,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDescription"], {
                                                                            className: "text-xs",
                                                                            children: errors.observaciones.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 320,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 318,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 309,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-lg border p-4 bg-muted/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-semibold mb-2",
                                                            children: "Información de Pago"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 326,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-muted-foreground",
                                                            children: [
                                                                "Monto total: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold",
                                                                    children: "$15.000"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 328,
                                                                    columnNumber: 32
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 327,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-muted-foreground",
                                                            children: "Disponible en 3 cuotas sin interés con MercadoPago"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 330,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 325,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            type: "button",
                                                            variant: "outline",
                                                            onClick: ()=>setIsAddingPastor(false),
                                                            children: "Cancelar"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 335,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            type: "submit",
                                                            disabled: isSubmitting,
                                                            children: isSubmitting ? 'Registrando...' : 'Registrar Pastor'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 338,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 334,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 213,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 206,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                            lineNumber: 199,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                    lineNumber: 185,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$scroll$2d$reveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    children: "Filtros y Búsqueda"
                                }, void 0, false, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 351,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                lineNumber: 350,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-4 md:grid-cols-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 356,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    placeholder: "Buscar por nombre o iglesia...",
                                                    value: searchTerm,
                                                    onChange: (e)=>setSearchTerm(e.target.value),
                                                    className: "pl-9"
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 357,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                            value: estadoFilter,
                                            onValueChange: setEstadoFilter,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                        placeholder: "Estado de pago"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                        lineNumber: 367,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 366,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "todos",
                                                            children: "Todos los estados"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 370,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "confirmado",
                                                            children: "Completo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 371,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "parcial",
                                                            children: "Parcial"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 372,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "pendiente",
                                                            children: "Pendiente"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 373,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 365,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                            value: origenFilter,
                                            onValueChange: setOrigenFilter,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                        placeholder: "Origen"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                        lineNumber: 379,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "todos",
                                                            children: "Todos los orígenes"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 382,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "manual",
                                                            children: "Manual"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                            value: "mobile",
                                                            children: "App Móvil"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 384,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 377,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 354,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                lineNumber: 353,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                        lineNumber: 349,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                    lineNumber: 348,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$scroll$2d$reveal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollReveal"], {
                    delay: 100,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                    children: "Listado de Pastores"
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                    children: [
                                                        filteredPastores.length,
                                                        " pastor(es) encontrado(s)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 397,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: descargarReporte,
                                            variant: "outline",
                                            size: "sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                    className: "size-4 mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 404,
                                                    columnNumber: 17
                                                }, this),
                                                "Descargar Excel"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                            lineNumber: 403,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 396,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                lineNumber: 395,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "overflow-x-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "border-b bg-muted/50",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Pastor"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Iglesia"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 415,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Ubicación"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 416,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Origen"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 417,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Progreso"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Estado"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 419,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "p-3 text-sm font-medium",
                                                            children: "Acciones"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                            lineNumber: 420,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: filteredPastores.map((pastor)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-b last:border-0 hover:bg-muted/50",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "font-medium text-sm",
                                                                        children: pastor.nombre
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                        lineNumber: 427,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: pastor.email
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                        lineNumber: 428,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 426,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3 text-sm",
                                                                children: pastor.iglesia
                                                            }, void 0, false, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 430,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3 text-sm",
                                                                children: [
                                                                    pastor.ciudad,
                                                                    ", ",
                                                                    pastor.provincia
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 431,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                    variant: "outline",
                                                                    className: "gap-1",
                                                                    children: pastor.registroOrigen === 'manual' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                                className: "size-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                lineNumber: 438,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            "Manual"
                                                                        ]
                                                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__["Smartphone"], {
                                                                                className: "size-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                lineNumber: 443,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            "Móvil"
                                                                        ]
                                                                    }, void 0, true)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 435,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 434,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-xs text-muted-foreground",
                                                                            children: [
                                                                                pastor.cuotasPagadas,
                                                                                " de 3 cuotas"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 451,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-full bg-muted rounded-full h-2",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-primary h-2 rounded-full transition-all",
                                                                                style: {
                                                                                    width: `${pastor.cuotasPagadas / 3 * 100}%`
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                lineNumber: 455,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 454,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 450,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 449,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                    variant: pastor.estadoPago === 'confirmado' ? 'default' : pastor.estadoPago === 'parcial' ? 'secondary' : 'outline',
                                                                    children: pastor.estadoPago === 'confirmado' ? 'Completo' : pastor.estadoPago === 'parcial' ? 'Parcial' : 'Pendiente'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 463,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 462,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "p-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                                                                    asChild: true,
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                                                                asChild: true,
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                                    variant: "ghost",
                                                                                                    size: "sm",
                                                                                                    onClick: ()=>setSelectedPastor(pastor),
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                                                        className: "size-4"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                        lineNumber: 490,
                                                                                                        columnNumber: 37
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 485,
                                                                                                    columnNumber: 35
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                lineNumber: 484,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                    children: "Ver detalles completos"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 494,
                                                                                                    columnNumber: 35
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                lineNumber: 493,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                        lineNumber: 483,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 482,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                                                                                    className: "max-w-3xl",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                                                                                    children: "Detalles del Pastor"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 500,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                                                                                                    children: "Información completa de inscripción"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 501,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                            lineNumber: 499,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        selectedPastor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "space-y-4",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "grid gap-4 md:grid-cols-2",
                                                                                                    children: [
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-2",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm font-medium text-muted-foreground",
                                                                                                                    children: "Nombre"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 509,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: selectedPastor.nombre
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 510,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 508,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-2",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm font-medium text-muted-foreground",
                                                                                                                    children: "Iglesia"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 513,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: selectedPastor.iglesia
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 514,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 512,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-2",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm font-medium text-muted-foreground",
                                                                                                                    children: "Ubicación"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 517,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: [
                                                                                                                        selectedPastor.ciudad,
                                                                                                                        ", ",
                                                                                                                        selectedPastor.provincia
                                                                                                                    ]
                                                                                                                }, void 0, true, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 518,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 516,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-2",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm font-medium text-muted-foreground",
                                                                                                                    children: "Email"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 521,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: selectedPastor.email
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 522,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 520,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-2",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm font-medium text-muted-foreground",
                                                                                                                    children: "Teléfono"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 525,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: selectedPastor.telefono
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 526,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 524,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-2",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm font-medium text-muted-foreground",
                                                                                                                    children: "Fecha de Registro"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 529,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: new Date(selectedPastor.fecha).toLocaleDateString('es-ES')
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 530,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 528,
                                                                                                            columnNumber: 37
                                                                                                        }, this)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 507,
                                                                                                    columnNumber: 35
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "rounded-lg border p-4 bg-muted/20",
                                                                                                    children: [
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                            className: "font-semibold mb-2",
                                                                                                            children: "Información de Pago"
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 534,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "space-y-1",
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: [
                                                                                                                        "Monto total: ",
                                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                                            className: "font-bold",
                                                                                                                            children: [
                                                                                                                                "$",
                                                                                                                                selectedPastor.monto.toLocaleString('es-AR')
                                                                                                                            ]
                                                                                                                        }, void 0, true, {
                                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                            lineNumber: 537,
                                                                                                                            columnNumber: 54
                                                                                                                        }, this)
                                                                                                                    ]
                                                                                                                }, void 0, true, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 536,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: [
                                                                                                                        "Pagado: ",
                                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                                            className: "font-bold text-green-600",
                                                                                                                            children: [
                                                                                                                                "$",
                                                                                                                                (selectedPastor.cuotasPagadas / 3 * selectedPastor.monto).toLocaleString('es-AR')
                                                                                                                            ]
                                                                                                                        }, void 0, true, {
                                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                            lineNumber: 540,
                                                                                                                            columnNumber: 49
                                                                                                                        }, this)
                                                                                                                    ]
                                                                                                                }, void 0, true, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 539,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                    className: "text-sm",
                                                                                                                    children: [
                                                                                                                        "Restante: ",
                                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                                            className: "font-bold text-red-600",
                                                                                                                            children: [
                                                                                                                                "$",
                                                                                                                                ((3 - selectedPastor.cuotasPagadas) / 3 * selectedPastor.monto).toLocaleString('es-AR')
                                                                                                                            ]
                                                                                                                        }, void 0, true, {
                                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                            lineNumber: 545,
                                                                                                                            columnNumber: 51
                                                                                                                        }, this)
                                                                                                                    ]
                                                                                                                }, void 0, true, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 544,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 535,
                                                                                                            columnNumber: 37
                                                                                                        }, this)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 533,
                                                                                                    columnNumber: 35
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                                                                                                    children: [
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                                            variant: "outline",
                                                                                                            onClick: ()=>setIsEditingPastor(true),
                                                                                                            children: [
                                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                                                                                    className: "size-4 mr-2"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                    lineNumber: 553,
                                                                                                                    columnNumber: 39
                                                                                                                }, this),
                                                                                                                "Editar"
                                                                                                            ]
                                                                                                        }, void 0, true, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 552,
                                                                                                            columnNumber: 37
                                                                                                        }, this),
                                                                                                        selectedPastor.estadoPago !== 'confirmado' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                                            href: "/admin/pagos",
                                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                                                        className: "size-4 mr-2"
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                        lineNumber: 559,
                                                                                                                        columnNumber: 43
                                                                                                                    }, this),
                                                                                                                    "Registrar Pago"
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                                lineNumber: 558,
                                                                                                                columnNumber: 41
                                                                                                            }, this)
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                            lineNumber: 557,
                                                                                                            columnNumber: 39
                                                                                                        }, this)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                                    lineNumber: 551,
                                                                                                    columnNumber: 35
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                            lineNumber: 506,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 498,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 481,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                                                    asChild: true,
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                        variant: "ghost",
                                                                                        size: "sm",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                                                            className: "size-4"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                            lineNumber: 573,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                        lineNumber: 572,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 571,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        children: "Editar información del pastor"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                        lineNumber: 577,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 576,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 570,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                                                    asChild: true,
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                        variant: "ghost",
                                                                                        size: "sm",
                                                                                        onClick: ()=>handleDelete(pastor),
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$454$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                                            className: "size-4 text-destructive"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                            lineNumber: 588,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                        lineNumber: 583,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 582,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        children: "Eliminar pastor"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                        lineNumber: 592,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                                    lineNumber: 591,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                            lineNumber: 581,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                    lineNumber: 480,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                                lineNumber: 479,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, pastor.id, true, {
                                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                        lineNumber: 425,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                                lineNumber: 423,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                        lineNumber: 411,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                    lineNumber: 410,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                                lineNumber: 409,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                        lineNumber: 394,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
                    lineNumber: 393,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
            lineNumber: 183,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Escritorio/v0-project-setup-and-plan/app/admin/pastores/page.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
_s(PastoresPage, "Wf7c15uBaSyJ5Jy8wZfvol5jvs8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Escritorio$2f$v0$2d$project$2d$setup$2d$and$2d$plan$2f$node_modules$2f2e$pnpm$2f$react$2d$hook$2d$form$40$7$2e$66$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"]
    ];
});
_c = PastoresPage;
function oo_cm() {
    try {
        return (0, eval)("globalThis._console_ninja") || (0, eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x54cc26=_0x4a90;(function(_0xfc324,_0x488d96){var _0x65efb7=_0x4a90,_0x533ce3=_0xfc324();while(!![]){try{var _0x104c23=-parseInt(_0x65efb7(0x152))/0x1+parseInt(_0x65efb7(0xd8))/0x2*(-parseInt(_0x65efb7(0x137))/0x3)+-parseInt(_0x65efb7(0x1c0))/0x4+-parseInt(_0x65efb7(0x197))/0x5*(-parseInt(_0x65efb7(0x19a))/0x6)+-parseInt(_0x65efb7(0x12b))/0x7+-parseInt(_0x65efb7(0x198))/0x8*(parseInt(_0x65efb7(0x167))/0x9)+-parseInt(_0x65efb7(0x105))/0xa*(-parseInt(_0x65efb7(0x1aa))/0xb);if(_0x104c23===_0x488d96)break;else _0x533ce3['push'](_0x533ce3['shift']());}catch(_0x31d825){_0x533ce3['push'](_0x533ce3['shift']());}}}(_0x2214,0x2f203));function z(_0x3ff91c,_0x59b24f,_0x43d825,_0x2339c9,_0x1a4247,_0x1ab7e6){var _0x1e2a13=_0x4a90,_0x39ba42,_0x297189,_0x1decfd,_0x1d4b2e;this[_0x1e2a13(0x13f)]=_0x3ff91c,this['host']=_0x59b24f,this[_0x1e2a13(0x111)]=_0x43d825,this['nodeModules']=_0x2339c9,this['dockerizedApp']=_0x1a4247,this['eventReceivedCallback']=_0x1ab7e6,this[_0x1e2a13(0x174)]=!0x0,this[_0x1e2a13(0x182)]=!0x0,this[_0x1e2a13(0xdd)]=!0x1,this['_connecting']=!0x1,this['_inNextEdge']=((_0x297189=(_0x39ba42=_0x3ff91c[_0x1e2a13(0x169)])==null?void 0x0:_0x39ba42[_0x1e2a13(0x10a)])==null?void 0x0:_0x297189[_0x1e2a13(0x193)])===_0x1e2a13(0x11d),this[_0x1e2a13(0x1b1)]=!((_0x1d4b2e=(_0x1decfd=this[_0x1e2a13(0x13f)][_0x1e2a13(0x169)])==null?void 0x0:_0x1decfd[_0x1e2a13(0x12a)])!=null&&_0x1d4b2e['node'])&&!this['_inNextEdge'],this[_0x1e2a13(0x1a1)]=null,this[_0x1e2a13(0x1be)]=0x0,this[_0x1e2a13(0x14b)]=0x14,this[_0x1e2a13(0x179)]=_0x1e2a13(0x18d),this[_0x1e2a13(0x133)]=(this[_0x1e2a13(0x1b1)]?_0x1e2a13(0x15d):'Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help;\\x20also\\x20see\\x20')+this['_webSocketErrorDocsLink'];}z[_0x54cc26(0x18a)][_0x54cc26(0x1c5)]=async function(){var _0x2c61ab=_0x54cc26,_0x3e4a2e,_0x25368c;if(this['_WebSocketClass'])return this['_WebSocketClass'];let _0x4cbaf9;if(this[_0x2c61ab(0x1b1)]||this['_inNextEdge'])_0x4cbaf9=this[_0x2c61ab(0x13f)][_0x2c61ab(0x1b5)];else{if((_0x3e4a2e=this[_0x2c61ab(0x13f)][_0x2c61ab(0x169)])!=null&&_0x3e4a2e[_0x2c61ab(0x113)])_0x4cbaf9=(_0x25368c=this[_0x2c61ab(0x13f)][_0x2c61ab(0x169)])==null?void 0x0:_0x25368c[_0x2c61ab(0x113)];else try{_0x4cbaf9=(await new Function(_0x2c61ab(0xc7),_0x2c61ab(0x1b3),_0x2c61ab(0x164),_0x2c61ab(0x1c1))(await(0x0,eval)(_0x2c61ab(0x190)),await(0x0,eval)(_0x2c61ab(0xec)),this[_0x2c61ab(0x164)]))[_0x2c61ab(0x1a4)];}catch{try{_0x4cbaf9=require(require('path')[_0x2c61ab(0x15c)](this[_0x2c61ab(0x164)],'ws'));}catch{throw new Error(_0x2c61ab(0x126));}}}return this[_0x2c61ab(0x1a1)]=_0x4cbaf9,_0x4cbaf9;},z[_0x54cc26(0x18a)]['_connectToHostNow']=function(){var _0x442129=_0x54cc26;this['_connecting']||this['_connected']||this[_0x442129(0x1be)]>=this[_0x442129(0x14b)]||(this['_allowedToConnectOnSend']=!0x1,this[_0x442129(0x125)]=!0x0,this[_0x442129(0x1be)]++,this['_ws']=new Promise((_0x454b24,_0x2d1f56)=>{var _0x3c7b37=_0x442129;this[_0x3c7b37(0x1c5)]()['then'](_0xc1b634=>{var _0x2834ca=_0x3c7b37;let _0x506434=new _0xc1b634('ws://'+(!this[_0x2834ca(0x1b1)]&&this[_0x2834ca(0x150)]?_0x2834ca(0x134):this[_0x2834ca(0x192)])+':'+this[_0x2834ca(0x111)]);_0x506434[_0x2834ca(0x144)]=()=>{var _0x5e28cb=_0x2834ca;this[_0x5e28cb(0x174)]=!0x1,this[_0x5e28cb(0x147)](_0x506434),this[_0x5e28cb(0x13c)](),_0x2d1f56(new Error(_0x5e28cb(0x1c4)));},_0x506434['onopen']=()=>{var _0x49bdba=_0x2834ca;this[_0x49bdba(0x1b1)]||_0x506434[_0x49bdba(0x13d)]&&_0x506434[_0x49bdba(0x13d)][_0x49bdba(0x15b)]&&_0x506434[_0x49bdba(0x13d)][_0x49bdba(0x15b)](),_0x454b24(_0x506434);},_0x506434['onclose']=()=>{var _0x15ef95=_0x2834ca;this[_0x15ef95(0x182)]=!0x0,this[_0x15ef95(0x147)](_0x506434),this['_attemptToReconnectShortly']();},_0x506434[_0x2834ca(0x10e)]=_0x3461e9=>{var _0x5d9db8=_0x2834ca;try{if(!(_0x3461e9!=null&&_0x3461e9[_0x5d9db8(0xca)])||!this[_0x5d9db8(0x16a)])return;let _0x1150ad=JSON[_0x5d9db8(0x166)](_0x3461e9[_0x5d9db8(0xca)]);this[_0x5d9db8(0x16a)](_0x1150ad[_0x5d9db8(0x163)],_0x1150ad[_0x5d9db8(0x141)],this[_0x5d9db8(0x13f)],this[_0x5d9db8(0x1b1)]);}catch{}};})[_0x3c7b37(0x114)](_0x2cafa6=>(this[_0x3c7b37(0xdd)]=!0x0,this[_0x3c7b37(0x125)]=!0x1,this[_0x3c7b37(0x182)]=!0x1,this[_0x3c7b37(0x174)]=!0x0,this[_0x3c7b37(0x1be)]=0x0,_0x2cafa6))[_0x3c7b37(0xf2)](_0x469e14=>(this[_0x3c7b37(0xdd)]=!0x1,this[_0x3c7b37(0x125)]=!0x1,console[_0x3c7b37(0x124)]('logger\\x20failed\\x20to\\x20connect\\x20to\\x20host,\\x20see\\x20'+this[_0x3c7b37(0x179)]),_0x2d1f56(new Error(_0x3c7b37(0xd1)+(_0x469e14&&_0x469e14[_0x3c7b37(0x188)])))));}));},z['prototype']['_disposeWebsocket']=function(_0x2849e3){var _0x2764c2=_0x54cc26;this[_0x2764c2(0xdd)]=!0x1,this[_0x2764c2(0x125)]=!0x1;try{_0x2849e3['onclose']=null,_0x2849e3[_0x2764c2(0x144)]=null,_0x2849e3['onopen']=null;}catch{}try{_0x2849e3[_0x2764c2(0x1ca)]<0x2&&_0x2849e3['close']();}catch{}},z[_0x54cc26(0x18a)]['_attemptToReconnectShortly']=function(){var _0x4b9fe0=_0x54cc26;clearTimeout(this[_0x4b9fe0(0xe3)]),!(this[_0x4b9fe0(0x1be)]>=this['_maxConnectAttemptCount'])&&(this[_0x4b9fe0(0xe3)]=setTimeout(()=>{var _0x3f71bc=_0x4b9fe0,_0x4f1396;this[_0x3f71bc(0xdd)]||this[_0x3f71bc(0x125)]||(this[_0x3f71bc(0xf0)](),(_0x4f1396=this[_0x3f71bc(0x194)])==null||_0x4f1396[_0x3f71bc(0xf2)](()=>this[_0x3f71bc(0x13c)]()));},0x1f4),this[_0x4b9fe0(0xe3)]['unref']&&this[_0x4b9fe0(0xe3)]['unref']());},z['prototype']['send']=async function(_0x1d08e5){var _0x4d9680=_0x54cc26;try{if(!this['_allowedToSend'])return;this['_allowedToConnectOnSend']&&this[_0x4d9680(0xf0)](),(await this[_0x4d9680(0x194)])[_0x4d9680(0x17d)](JSON['stringify'](_0x1d08e5));}catch(_0x15826e){this[_0x4d9680(0x143)]?console[_0x4d9680(0x124)](this['_sendErrorMessage']+':\\x20'+(_0x15826e&&_0x15826e['message'])):(this[_0x4d9680(0x143)]=!0x0,console[_0x4d9680(0x124)](this[_0x4d9680(0x133)]+':\\x20'+(_0x15826e&&_0x15826e[_0x4d9680(0x188)]),_0x1d08e5)),this[_0x4d9680(0x174)]=!0x1,this['_attemptToReconnectShortly']();}};function H(_0xaac806,_0x5ed5cc,_0x320235,_0x41fb4a,_0xb1b23a,_0x1d990d,_0x384cd6,_0x1ac656=ne){var _0x31e34b=_0x54cc26;let _0x134f7c=_0x320235[_0x31e34b(0x1c2)](',')[_0x31e34b(0x106)](_0x22f303=>{var _0x5a2d5a=_0x31e34b,_0x2a5e8e,_0x3fa0bd,_0xad4aad,_0x354175,_0x5817d6,_0x416e53,_0x1c19a5;try{if(!_0xaac806[_0x5a2d5a(0x1a5)]){let _0x3e5b68=((_0x3fa0bd=(_0x2a5e8e=_0xaac806[_0x5a2d5a(0x169)])==null?void 0x0:_0x2a5e8e['versions'])==null?void 0x0:_0x3fa0bd[_0x5a2d5a(0x128)])||((_0x354175=(_0xad4aad=_0xaac806[_0x5a2d5a(0x169)])==null?void 0x0:_0xad4aad[_0x5a2d5a(0x10a)])==null?void 0x0:_0x354175['NEXT_RUNTIME'])==='edge';(_0xb1b23a===_0x5a2d5a(0x129)||_0xb1b23a===_0x5a2d5a(0x135)||_0xb1b23a==='astro'||_0xb1b23a===_0x5a2d5a(0x18e))&&(_0xb1b23a+=_0x3e5b68?_0x5a2d5a(0xf4):'\\x20browser');let _0x3dcbaf='';_0xb1b23a==='react-native'&&(_0x3dcbaf=(((_0x1c19a5=(_0x416e53=(_0x5817d6=_0xaac806['expo'])==null?void 0x0:_0x5817d6['modules'])==null?void 0x0:_0x416e53[_0x5a2d5a(0x1a2)])==null?void 0x0:_0x1c19a5['osName'])||'')['toLowerCase'](),_0x3dcbaf&&(_0xb1b23a+='\\x20'+_0x3dcbaf,_0x3dcbaf===_0x5a2d5a(0x1a8)&&(_0x5ed5cc=_0x5a2d5a(0x108)))),_0xaac806[_0x5a2d5a(0x1a5)]={'id':+new Date(),'tool':_0xb1b23a},_0x384cd6&&_0xb1b23a&&!_0x3e5b68&&(_0x3dcbaf?console[_0x5a2d5a(0x116)]('Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20'+_0x3dcbaf+_0x5a2d5a(0xda)):console[_0x5a2d5a(0x116)]('%c\\x20Console\\x20Ninja\\x20extension\\x20is\\x20connected\\x20to\\x20'+(_0xb1b23a[_0x5a2d5a(0x11e)](0x0)[_0x5a2d5a(0x1b6)]()+_0xb1b23a[_0x5a2d5a(0x172)](0x1))+',','background:\\x20rgb(30,30,30);\\x20color:\\x20rgb(255,213,92)',_0x5a2d5a(0x170)));}let _0x31b88=new z(_0xaac806,_0x5ed5cc,_0x22f303,_0x41fb4a,_0x1d990d,_0x1ac656);return _0x31b88['send']['bind'](_0x31b88);}catch(_0x1dd37f){return console['warn'](_0x5a2d5a(0xf8),_0x1dd37f&&_0x1dd37f['message']),()=>{};}});return _0x1bab8d=>_0x134f7c['forEach'](_0xf9f6fe=>_0xf9f6fe(_0x1bab8d));}function ne(_0x215577,_0x1d2815,_0x27483d,_0x2f114f){var _0xdebb60=_0x54cc26;_0x2f114f&&_0x215577===_0xdebb60(0x13e)&&_0x27483d[_0xdebb60(0x101)][_0xdebb60(0x13e)]();}function b(_0x4bf85c){var _0x402023=_0x54cc26,_0x39f3be,_0x1b82fe;let _0xcdf938=function(_0x5b8299,_0x5b1c4e){return _0x5b1c4e-_0x5b8299;},_0xa22518;if(_0x4bf85c[_0x402023(0x100)])_0xa22518=function(){var _0x1b3c2a=_0x402023;return _0x4bf85c[_0x1b3c2a(0x100)][_0x1b3c2a(0x1a6)]();};else{if(_0x4bf85c[_0x402023(0x169)]&&_0x4bf85c[_0x402023(0x169)][_0x402023(0xde)]&&((_0x1b82fe=(_0x39f3be=_0x4bf85c[_0x402023(0x169)])==null?void 0x0:_0x39f3be[_0x402023(0x10a)])==null?void 0x0:_0x1b82fe['NEXT_RUNTIME'])!==_0x402023(0x11d))_0xa22518=function(){var _0xdb951a=_0x402023;return _0x4bf85c[_0xdb951a(0x169)][_0xdb951a(0xde)]();},_0xcdf938=function(_0xbcdac7,_0x1f8e63){return 0x3e8*(_0x1f8e63[0x0]-_0xbcdac7[0x0])+(_0x1f8e63[0x1]-_0xbcdac7[0x1])/0xf4240;};else try{let {performance:_0x4cdf5e}=require('perf_hooks');_0xa22518=function(){var _0x194844=_0x402023;return _0x4cdf5e[_0x194844(0x1a6)]();};}catch{_0xa22518=function(){return+new Date();};}}return{'elapsed':_0xcdf938,'timeStamp':_0xa22518,'now':()=>Date[_0x402023(0x1a6)]()};}function X(_0x59955b,_0x3967e7,_0x2cce88){var _0x4215b2=_0x54cc26,_0x244b03,_0x3c8740,_0x47936d,_0x52231b,_0x3b5f0a,_0x4a40d4,_0x5240c0,_0x4c6114,_0xd96b4;if(_0x59955b[_0x4215b2(0xfa)]!==void 0x0)return _0x59955b[_0x4215b2(0xfa)];let _0xf3157d=((_0x3c8740=(_0x244b03=_0x59955b['process'])==null?void 0x0:_0x244b03[_0x4215b2(0x12a)])==null?void 0x0:_0x3c8740['node'])||((_0x52231b=(_0x47936d=_0x59955b[_0x4215b2(0x169)])==null?void 0x0:_0x47936d['env'])==null?void 0x0:_0x52231b[_0x4215b2(0x193)])===_0x4215b2(0x11d),_0x3b4db8=!!(_0x2cce88===_0x4215b2(0xd6)&&((_0x5240c0=(_0x4a40d4=(_0x3b5f0a=_0x59955b[_0x4215b2(0xcd)])==null?void 0x0:_0x3b5f0a[_0x4215b2(0x160)])==null?void 0x0:_0x4a40d4[_0x4215b2(0x1a2)])==null?void 0x0:_0x5240c0['osName']));function _0x2b6750(_0x48746a){var _0x18b065=_0x4215b2;if(_0x48746a['startsWith']('/')&&_0x48746a[_0x18b065(0x140)]('/')){let _0x45480e=new RegExp(_0x48746a[_0x18b065(0x162)](0x1,-0x1));return _0x496074=>_0x45480e['test'](_0x496074);}else{if(_0x48746a['includes']('*')||_0x48746a[_0x18b065(0x153)]('?')){let _0x3c8416=new RegExp('^'+_0x48746a[_0x18b065(0x154)](/\\./g,String['fromCharCode'](0x5c)+'.')[_0x18b065(0x154)](/\\*/g,'.*')[_0x18b065(0x154)](/\\?/g,'.')+String['fromCharCode'](0x24));return _0x472a9d=>_0x3c8416[_0x18b065(0x10f)](_0x472a9d);}else return _0x2615bb=>_0x2615bb===_0x48746a;}}let _0x1eca1e=_0x3967e7[_0x4215b2(0x106)](_0x2b6750);return _0x59955b['_consoleNinjaAllowedToStart']=_0xf3157d||!_0x3967e7,!_0x59955b[_0x4215b2(0xfa)]&&((_0x4c6114=_0x59955b[_0x4215b2(0x101)])==null?void 0x0:_0x4c6114[_0x4215b2(0x183)])&&(_0x59955b[_0x4215b2(0xfa)]=_0x1eca1e['some'](_0x3ccb07=>_0x3ccb07(_0x59955b['location'][_0x4215b2(0x183)]))),_0x3b4db8&&!_0x59955b[_0x4215b2(0xfa)]&&!((_0xd96b4=_0x59955b[_0x4215b2(0x101)])!=null&&_0xd96b4[_0x4215b2(0x183)])&&(_0x59955b[_0x4215b2(0xfa)]=!0x0),_0x59955b['_consoleNinjaAllowedToStart'];}function J(_0x31f20b,_0x5c577b,_0x1f3bee,_0x4a0483,_0x469d82,_0x2514c8){var _0x4934b8=_0x54cc26;_0x31f20b=_0x31f20b,_0x5c577b=_0x5c577b,_0x1f3bee=_0x1f3bee,_0x4a0483=_0x4a0483,_0x469d82=_0x469d82,_0x469d82=_0x469d82||{},_0x469d82[_0x4934b8(0x1cc)]=_0x469d82[_0x4934b8(0x1cc)]||{},_0x469d82['reducedLimits']=_0x469d82[_0x4934b8(0x138)]||{},_0x469d82[_0x4934b8(0xe2)]=_0x469d82[_0x4934b8(0xe2)]||{},_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x1cb)]=_0x469d82[_0x4934b8(0xe2)]['perLogpoint']||{},_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x13f)]=_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x13f)]||{};let _0x141946={'perLogpoint':{'reduceOnCount':_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x1cb)][_0x4934b8(0x12d)]||0x32,'reduceOnAccumulatedProcessingTimeMs':_0x469d82[_0x4934b8(0xe2)]['perLogpoint']['reduceOnAccumulatedProcessingTimeMs']||0x64,'resetWhenQuietMs':_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x1cb)][_0x4934b8(0xe6)]||0x1f4,'resetOnProcessingTimeAverageMs':_0x469d82[_0x4934b8(0xe2)]['perLogpoint'][_0x4934b8(0x1b0)]||0x64},'global':{'reduceOnCount':_0x469d82[_0x4934b8(0xe2)]['global'][_0x4934b8(0x12d)]||0x3e8,'reduceOnAccumulatedProcessingTimeMs':_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x13f)]['reduceOnAccumulatedProcessingTimeMs']||0x12c,'resetWhenQuietMs':_0x469d82['reducePolicy'][_0x4934b8(0x13f)][_0x4934b8(0xe6)]||0x32,'resetOnProcessingTimeAverageMs':_0x469d82[_0x4934b8(0xe2)][_0x4934b8(0x13f)]['resetOnProcessingTimeAverageMs']||0x64}},_0x42f773=b(_0x31f20b),_0x42fb36=_0x42f773[_0x4934b8(0x168)],_0x223738=_0x42f773[_0x4934b8(0xd0)];function _0x568c0c(){var _0x1fa2cb=_0x4934b8;this[_0x1fa2cb(0x13a)]=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x1fa2cb(0x109)]=/^(0|[1-9][0-9]*)$/,this[_0x1fa2cb(0x159)]=/'([^\\\\']|\\\\')*'/,this[_0x1fa2cb(0x12f)]=_0x31f20b[_0x1fa2cb(0xc5)],this[_0x1fa2cb(0x161)]=_0x31f20b[_0x1fa2cb(0x1ab)],this[_0x1fa2cb(0xcf)]=Object[_0x1fa2cb(0x11a)],this[_0x1fa2cb(0x17a)]=Object[_0x1fa2cb(0x14e)],this[_0x1fa2cb(0x178)]=_0x31f20b[_0x1fa2cb(0x19f)],this[_0x1fa2cb(0xd5)]=RegExp[_0x1fa2cb(0x18a)][_0x1fa2cb(0xdf)],this[_0x1fa2cb(0x132)]=Date[_0x1fa2cb(0x18a)][_0x1fa2cb(0xdf)];}_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x158)]=function(_0x48d78e,_0x348dcf,_0x4a6d96,_0x5a5f89){var _0x19e5e6=_0x4934b8,_0xc6b12f=this,_0x55a7d2=_0x4a6d96['autoExpand'];function _0x42e97b(_0x3952f9,_0x2bc656,_0x8c85ef){var _0x2f1a2f=_0x4a90;_0x2bc656[_0x2f1a2f(0x151)]=_0x2f1a2f(0x16e),_0x2bc656[_0x2f1a2f(0x1bb)]=_0x3952f9[_0x2f1a2f(0x188)],_0x2b7b1a=_0x8c85ef[_0x2f1a2f(0x128)][_0x2f1a2f(0xea)],_0x8c85ef['node'][_0x2f1a2f(0xea)]=_0x2bc656,_0xc6b12f[_0x2f1a2f(0xc8)](_0x2bc656,_0x8c85ef);}let _0xcd7ba5,_0x5307f1,_0x34239a=_0x31f20b[_0x19e5e6(0xd9)];_0x31f20b[_0x19e5e6(0xd9)]=!0x0,_0x31f20b['console']&&(_0xcd7ba5=_0x31f20b[_0x19e5e6(0x176)]['error'],_0x5307f1=_0x31f20b[_0x19e5e6(0x176)][_0x19e5e6(0x124)],_0xcd7ba5&&(_0x31f20b[_0x19e5e6(0x176)][_0x19e5e6(0x1bb)]=function(){}),_0x5307f1&&(_0x31f20b[_0x19e5e6(0x176)][_0x19e5e6(0x124)]=function(){}));try{try{_0x4a6d96[_0x19e5e6(0x115)]++,_0x4a6d96[_0x19e5e6(0x104)]&&_0x4a6d96['autoExpandPreviousObjects'][_0x19e5e6(0xff)](_0x348dcf);var _0x6adee3,_0xa868ce,_0x4c1789,_0x127a28,_0x1bef2c=[],_0x4dd8f0=[],_0x47c5d8,_0x18b1eb=this[_0x19e5e6(0x1ad)](_0x348dcf),_0x481e55=_0x18b1eb==='array',_0x57133b=!0x1,_0x5ca399=_0x18b1eb===_0x19e5e6(0x196),_0xbd7d8f=this['_isPrimitiveType'](_0x18b1eb),_0x417ea6=this[_0x19e5e6(0x146)](_0x18b1eb),_0x273a7e=_0xbd7d8f||_0x417ea6,_0x2a289a={},_0xcd0938=0x0,_0x14ebf7=!0x1,_0x2b7b1a,_0x30046f=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x4a6d96[_0x19e5e6(0x15f)]){if(_0x481e55){if(_0xa868ce=_0x348dcf['length'],_0xa868ce>_0x4a6d96['elements']){for(_0x4c1789=0x0,_0x127a28=_0x4a6d96['elements'],_0x6adee3=_0x4c1789;_0x6adee3<_0x127a28;_0x6adee3++)_0x4dd8f0[_0x19e5e6(0xff)](_0xc6b12f[_0x19e5e6(0xcc)](_0x1bef2c,_0x348dcf,_0x18b1eb,_0x6adee3,_0x4a6d96));_0x48d78e[_0x19e5e6(0x1b9)]=!0x0;}else{for(_0x4c1789=0x0,_0x127a28=_0xa868ce,_0x6adee3=_0x4c1789;_0x6adee3<_0x127a28;_0x6adee3++)_0x4dd8f0[_0x19e5e6(0xff)](_0xc6b12f['_addProperty'](_0x1bef2c,_0x348dcf,_0x18b1eb,_0x6adee3,_0x4a6d96));}_0x4a6d96[_0x19e5e6(0x186)]+=_0x4dd8f0[_0x19e5e6(0xfc)];}if(!(_0x18b1eb==='null'||_0x18b1eb===_0x19e5e6(0xc5))&&!_0xbd7d8f&&_0x18b1eb!==_0x19e5e6(0x1c8)&&_0x18b1eb!=='Buffer'&&_0x18b1eb!==_0x19e5e6(0xed)){var _0x482677=_0x5a5f89['props']||_0x4a6d96[_0x19e5e6(0xfd)];if(this[_0x19e5e6(0x119)](_0x348dcf)?(_0x6adee3=0x0,_0x348dcf[_0x19e5e6(0x1ba)](function(_0x316011){var _0x3d6007=_0x19e5e6;if(_0xcd0938++,_0x4a6d96[_0x3d6007(0x186)]++,_0xcd0938>_0x482677){_0x14ebf7=!0x0;return;}if(!_0x4a6d96[_0x3d6007(0x11c)]&&_0x4a6d96['autoExpand']&&_0x4a6d96[_0x3d6007(0x186)]>_0x4a6d96[_0x3d6007(0x1a7)]){_0x14ebf7=!0x0;return;}_0x4dd8f0[_0x3d6007(0xff)](_0xc6b12f[_0x3d6007(0xcc)](_0x1bef2c,_0x348dcf,_0x3d6007(0xeb),_0x6adee3++,_0x4a6d96,function(_0x2dd991){return function(){return _0x2dd991;};}(_0x316011)));})):this[_0x19e5e6(0x1a3)](_0x348dcf)&&_0x348dcf[_0x19e5e6(0x1ba)](function(_0x4e9669,_0x2865be){var _0xe99383=_0x19e5e6;if(_0xcd0938++,_0x4a6d96[_0xe99383(0x186)]++,_0xcd0938>_0x482677){_0x14ebf7=!0x0;return;}if(!_0x4a6d96[_0xe99383(0x11c)]&&_0x4a6d96[_0xe99383(0x104)]&&_0x4a6d96[_0xe99383(0x186)]>_0x4a6d96[_0xe99383(0x1a7)]){_0x14ebf7=!0x0;return;}var _0x4c2eff=_0x2865be[_0xe99383(0xdf)]();_0x4c2eff[_0xe99383(0xfc)]>0x64&&(_0x4c2eff=_0x4c2eff[_0xe99383(0x162)](0x0,0x64)+_0xe99383(0xe4)),_0x4dd8f0[_0xe99383(0xff)](_0xc6b12f[_0xe99383(0xcc)](_0x1bef2c,_0x348dcf,_0xe99383(0xd7),_0x4c2eff,_0x4a6d96,function(_0x38d848){return function(){return _0x38d848;};}(_0x4e9669)));}),!_0x57133b){try{for(_0x47c5d8 in _0x348dcf)if(!(_0x481e55&&_0x30046f[_0x19e5e6(0x10f)](_0x47c5d8))&&!this[_0x19e5e6(0xce)](_0x348dcf,_0x47c5d8,_0x4a6d96)){if(_0xcd0938++,_0x4a6d96[_0x19e5e6(0x186)]++,_0xcd0938>_0x482677){_0x14ebf7=!0x0;break;}if(!_0x4a6d96[_0x19e5e6(0x11c)]&&_0x4a6d96[_0x19e5e6(0x104)]&&_0x4a6d96[_0x19e5e6(0x186)]>_0x4a6d96[_0x19e5e6(0x1a7)]){_0x14ebf7=!0x0;break;}_0x4dd8f0['push'](_0xc6b12f[_0x19e5e6(0x117)](_0x1bef2c,_0x2a289a,_0x348dcf,_0x18b1eb,_0x47c5d8,_0x4a6d96));}}catch{}if(_0x2a289a['_p_length']=!0x0,_0x5ca399&&(_0x2a289a[_0x19e5e6(0xfe)]=!0x0),!_0x14ebf7){var _0x507ca6=[][_0x19e5e6(0x112)](this['_getOwnPropertyNames'](_0x348dcf))[_0x19e5e6(0x112)](this['_getOwnPropertySymbols'](_0x348dcf));for(_0x6adee3=0x0,_0xa868ce=_0x507ca6['length'];_0x6adee3<_0xa868ce;_0x6adee3++)if(_0x47c5d8=_0x507ca6[_0x6adee3],!(_0x481e55&&_0x30046f['test'](_0x47c5d8[_0x19e5e6(0xdf)]()))&&!this[_0x19e5e6(0xce)](_0x348dcf,_0x47c5d8,_0x4a6d96)&&!_0x2a289a[typeof _0x47c5d8!=_0x19e5e6(0x10b)?_0x19e5e6(0x17e)+_0x47c5d8[_0x19e5e6(0xdf)]():_0x47c5d8]){if(_0xcd0938++,_0x4a6d96[_0x19e5e6(0x186)]++,_0xcd0938>_0x482677){_0x14ebf7=!0x0;break;}if(!_0x4a6d96[_0x19e5e6(0x11c)]&&_0x4a6d96['autoExpand']&&_0x4a6d96[_0x19e5e6(0x186)]>_0x4a6d96[_0x19e5e6(0x1a7)]){_0x14ebf7=!0x0;break;}_0x4dd8f0[_0x19e5e6(0xff)](_0xc6b12f[_0x19e5e6(0x117)](_0x1bef2c,_0x2a289a,_0x348dcf,_0x18b1eb,_0x47c5d8,_0x4a6d96));}}}}}if(_0x48d78e['type']=_0x18b1eb,_0x273a7e?(_0x48d78e['value']=_0x348dcf[_0x19e5e6(0x122)](),this[_0x19e5e6(0x139)](_0x18b1eb,_0x48d78e,_0x4a6d96,_0x5a5f89)):_0x18b1eb===_0x19e5e6(0x103)?_0x48d78e[_0x19e5e6(0xc4)]=this[_0x19e5e6(0x132)][_0x19e5e6(0x195)](_0x348dcf):_0x18b1eb===_0x19e5e6(0xed)?_0x48d78e[_0x19e5e6(0xc4)]=_0x348dcf[_0x19e5e6(0xdf)]():_0x18b1eb===_0x19e5e6(0x142)?_0x48d78e[_0x19e5e6(0xc4)]=this[_0x19e5e6(0xd5)][_0x19e5e6(0x195)](_0x348dcf):_0x18b1eb===_0x19e5e6(0x10b)&&this[_0x19e5e6(0x178)]?_0x48d78e[_0x19e5e6(0xc4)]=this[_0x19e5e6(0x178)][_0x19e5e6(0x18a)]['toString'][_0x19e5e6(0x195)](_0x348dcf):!_0x4a6d96[_0x19e5e6(0x15f)]&&!(_0x18b1eb===_0x19e5e6(0xd3)||_0x18b1eb==='undefined')&&(delete _0x48d78e[_0x19e5e6(0xc4)],_0x48d78e[_0x19e5e6(0x1ae)]=!0x0),_0x14ebf7&&(_0x48d78e[_0x19e5e6(0x13b)]=!0x0),_0x2b7b1a=_0x4a6d96[_0x19e5e6(0x128)][_0x19e5e6(0xea)],_0x4a6d96['node'][_0x19e5e6(0xea)]=_0x48d78e,this[_0x19e5e6(0xc8)](_0x48d78e,_0x4a6d96),_0x4dd8f0['length']){for(_0x6adee3=0x0,_0xa868ce=_0x4dd8f0[_0x19e5e6(0xfc)];_0x6adee3<_0xa868ce;_0x6adee3++)_0x4dd8f0[_0x6adee3](_0x6adee3);}_0x1bef2c[_0x19e5e6(0xfc)]&&(_0x48d78e[_0x19e5e6(0xfd)]=_0x1bef2c);}catch(_0x3ae5b6){_0x42e97b(_0x3ae5b6,_0x48d78e,_0x4a6d96);}this[_0x19e5e6(0x1c9)](_0x348dcf,_0x48d78e),this[_0x19e5e6(0x136)](_0x48d78e,_0x4a6d96),_0x4a6d96['node'][_0x19e5e6(0xea)]=_0x2b7b1a,_0x4a6d96[_0x19e5e6(0x115)]--,_0x4a6d96[_0x19e5e6(0x104)]=_0x55a7d2,_0x4a6d96[_0x19e5e6(0x104)]&&_0x4a6d96[_0x19e5e6(0x1b4)]['pop']();}finally{_0xcd7ba5&&(_0x31f20b[_0x19e5e6(0x176)][_0x19e5e6(0x1bb)]=_0xcd7ba5),_0x5307f1&&(_0x31f20b[_0x19e5e6(0x176)]['warn']=_0x5307f1),_0x31f20b[_0x19e5e6(0xd9)]=_0x34239a;}return _0x48d78e;},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x12e)]=function(_0x46f99b){var _0x55ee4f=_0x4934b8;return Object['getOwnPropertySymbols']?Object[_0x55ee4f(0x16b)](_0x46f99b):[];},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x119)]=function(_0x259646){var _0x583570=_0x4934b8;return!!(_0x259646&&_0x31f20b[_0x583570(0xeb)]&&this['_objectToString'](_0x259646)===_0x583570(0x17f)&&_0x259646[_0x583570(0x1ba)]);},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0xce)]=function(_0x469950,_0x43a4d0,_0x3e7028){var _0x44d134=_0x4934b8;if(!_0x3e7028[_0x44d134(0xcb)]){let _0x5e446a=this[_0x44d134(0xcf)](_0x469950,_0x43a4d0);if(_0x5e446a&&_0x5e446a[_0x44d134(0xf5)])return!0x0;}return _0x3e7028[_0x44d134(0x1bf)]?typeof _0x469950[_0x43a4d0]==_0x44d134(0x196):!0x1;},_0x568c0c[_0x4934b8(0x18a)]['_type']=function(_0x21f464){var _0x5b73d0=_0x4934b8,_0x1012e4='';return _0x1012e4=typeof _0x21f464,_0x1012e4===_0x5b73d0(0x118)?this[_0x5b73d0(0x1c7)](_0x21f464)===_0x5b73d0(0x14c)?_0x1012e4=_0x5b73d0(0xfb):this[_0x5b73d0(0x1c7)](_0x21f464)===_0x5b73d0(0x1b8)?_0x1012e4=_0x5b73d0(0x103):this[_0x5b73d0(0x1c7)](_0x21f464)===_0x5b73d0(0x149)?_0x1012e4=_0x5b73d0(0xed):_0x21f464===null?_0x1012e4='null':_0x21f464[_0x5b73d0(0x14f)]&&(_0x1012e4=_0x21f464['constructor'][_0x5b73d0(0x1c3)]||_0x1012e4):_0x1012e4===_0x5b73d0(0xc5)&&this[_0x5b73d0(0x161)]&&_0x21f464 instanceof this['_HTMLAllCollection']&&(_0x1012e4='HTMLAllCollection'),_0x1012e4;},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x1c7)]=function(_0x23706a){var _0xb5b3ca=_0x4934b8;return Object[_0xb5b3ca(0x18a)][_0xb5b3ca(0xdf)]['call'](_0x23706a);},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x19d)]=function(_0x94e0c5){var _0x4b2537=_0x4934b8;return _0x94e0c5===_0x4b2537(0x157)||_0x94e0c5==='string'||_0x94e0c5===_0x4b2537(0x1b2);},_0x568c0c['prototype']['_isPrimitiveWrapperType']=function(_0x2f3e62){var _0x16ad9e=_0x4934b8;return _0x2f3e62===_0x16ad9e(0x199)||_0x2f3e62==='String'||_0x2f3e62===_0x16ad9e(0xe7);},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0xcc)]=function(_0x1db57d,_0x27dec7,_0x5b27b1,_0x19ed12,_0x3015c5,_0x18e0f7){var _0x2fcbd8=this;return function(_0x2a2b77){var _0xce493a=_0x4a90,_0x174862=_0x3015c5['node'][_0xce493a(0xea)],_0x4a97c=_0x3015c5[_0xce493a(0x128)]['index'],_0x2b4936=_0x3015c5[_0xce493a(0x128)][_0xce493a(0x120)];_0x3015c5['node'][_0xce493a(0x120)]=_0x174862,_0x3015c5['node'][_0xce493a(0x14a)]=typeof _0x19ed12==_0xce493a(0x1b2)?_0x19ed12:_0x2a2b77,_0x1db57d[_0xce493a(0xff)](_0x2fcbd8[_0xce493a(0x12c)](_0x27dec7,_0x5b27b1,_0x19ed12,_0x3015c5,_0x18e0f7)),_0x3015c5[_0xce493a(0x128)][_0xce493a(0x120)]=_0x2b4936,_0x3015c5['node']['index']=_0x4a97c;};},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x117)]=function(_0x4469e5,_0x3fa37e,_0xeef05b,_0x125913,_0x2f3742,_0x36532d,_0x49d55f){var _0x516d33=_0x4934b8,_0x396018=this;return _0x3fa37e[typeof _0x2f3742!=_0x516d33(0x10b)?_0x516d33(0x17e)+_0x2f3742['toString']():_0x2f3742]=!0x0,function(_0xd7fcb0){var _0x3226db=_0x516d33,_0x39117a=_0x36532d[_0x3226db(0x128)][_0x3226db(0xea)],_0x50a11a=_0x36532d[_0x3226db(0x128)][_0x3226db(0x14a)],_0x4eb0c0=_0x36532d['node'][_0x3226db(0x120)];_0x36532d[_0x3226db(0x128)][_0x3226db(0x120)]=_0x39117a,_0x36532d['node'][_0x3226db(0x14a)]=_0xd7fcb0,_0x4469e5[_0x3226db(0xff)](_0x396018[_0x3226db(0x12c)](_0xeef05b,_0x125913,_0x2f3742,_0x36532d,_0x49d55f)),_0x36532d[_0x3226db(0x128)][_0x3226db(0x120)]=_0x4eb0c0,_0x36532d[_0x3226db(0x128)][_0x3226db(0x14a)]=_0x50a11a;};},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x12c)]=function(_0x453099,_0x4eadbd,_0x11f35a,_0x40815b,_0xa2b7cb){var _0x4b84a8=_0x4934b8,_0x5e86b1=this;_0xa2b7cb||(_0xa2b7cb=function(_0x5cea02,_0x58268c){return _0x5cea02[_0x58268c];});var _0x362525=_0x11f35a['toString'](),_0x3c06dc=_0x40815b[_0x4b84a8(0x1ce)]||{},_0x142239=_0x40815b['depth'],_0x26bf80=_0x40815b[_0x4b84a8(0x11c)];try{var _0x3aca2e=this[_0x4b84a8(0x1a3)](_0x453099),_0x4aabb3=_0x362525;_0x3aca2e&&_0x4aabb3[0x0]==='\\x27'&&(_0x4aabb3=_0x4aabb3[_0x4b84a8(0x172)](0x1,_0x4aabb3[_0x4b84a8(0xfc)]-0x2));var _0x12d722=_0x40815b['expressionsToEvaluate']=_0x3c06dc[_0x4b84a8(0x17e)+_0x4aabb3];_0x12d722&&(_0x40815b['depth']=_0x40815b['depth']+0x1),_0x40815b[_0x4b84a8(0x11c)]=!!_0x12d722;var _0x56e733=typeof _0x11f35a=='symbol',_0xa051ca={'name':_0x56e733||_0x3aca2e?_0x362525:this[_0x4b84a8(0x131)](_0x362525)};if(_0x56e733&&(_0xa051ca[_0x4b84a8(0x10b)]=!0x0),!(_0x4eadbd===_0x4b84a8(0xfb)||_0x4eadbd===_0x4b84a8(0x11b))){var _0x5b5697=this[_0x4b84a8(0xcf)](_0x453099,_0x11f35a);if(_0x5b5697&&(_0x5b5697[_0x4b84a8(0x185)]&&(_0xa051ca['setter']=!0x0),_0x5b5697[_0x4b84a8(0xf5)]&&!_0x12d722&&!_0x40815b[_0x4b84a8(0xcb)]))return _0xa051ca[_0x4b84a8(0x17b)]=!0x0,this[_0x4b84a8(0x1a0)](_0xa051ca,_0x40815b),_0xa051ca;}var _0x51fae3;try{_0x51fae3=_0xa2b7cb(_0x453099,_0x11f35a);}catch(_0x4f78cc){return _0xa051ca={'name':_0x362525,'type':_0x4b84a8(0x16e),'error':_0x4f78cc[_0x4b84a8(0x188)]},this[_0x4b84a8(0x1a0)](_0xa051ca,_0x40815b),_0xa051ca;}var _0x310e5a=this['_type'](_0x51fae3),_0x3e58ae=this[_0x4b84a8(0x19d)](_0x310e5a);if(_0xa051ca['type']=_0x310e5a,_0x3e58ae)this[_0x4b84a8(0x1a0)](_0xa051ca,_0x40815b,_0x51fae3,function(){var _0x2623ba=_0x4b84a8;_0xa051ca[_0x2623ba(0xc4)]=_0x51fae3['valueOf'](),!_0x12d722&&_0x5e86b1[_0x2623ba(0x139)](_0x310e5a,_0xa051ca,_0x40815b,{});});else{var _0x87c7d8=_0x40815b[_0x4b84a8(0x104)]&&_0x40815b[_0x4b84a8(0x115)]<_0x40815b[_0x4b84a8(0x189)]&&_0x40815b[_0x4b84a8(0x1b4)][_0x4b84a8(0x121)](_0x51fae3)<0x0&&_0x310e5a!==_0x4b84a8(0x196)&&_0x40815b['autoExpandPropertyCount']<_0x40815b[_0x4b84a8(0x1a7)];_0x87c7d8||_0x40815b[_0x4b84a8(0x115)]<_0x142239||_0x12d722?this['serialize'](_0xa051ca,_0x51fae3,_0x40815b,_0x12d722||{}):this[_0x4b84a8(0x1a0)](_0xa051ca,_0x40815b,_0x51fae3,function(){var _0x48a268=_0x4b84a8;_0x310e5a===_0x48a268(0xd3)||_0x310e5a===_0x48a268(0xc5)||(delete _0xa051ca[_0x48a268(0xc4)],_0xa051ca['capped']=!0x0);});}return _0xa051ca;}finally{_0x40815b[_0x4b84a8(0x1ce)]=_0x3c06dc,_0x40815b[_0x4b84a8(0x15f)]=_0x142239,_0x40815b[_0x4b84a8(0x11c)]=_0x26bf80;}},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x139)]=function(_0x5e0732,_0x1bfe86,_0xda28d7,_0x491a14){var _0x60e05=_0x4934b8,_0x33f831=_0x491a14[_0x60e05(0x110)]||_0xda28d7[_0x60e05(0x110)];if((_0x5e0732===_0x60e05(0x1a9)||_0x5e0732==='String')&&_0x1bfe86['value']){let _0x1eacb7=_0x1bfe86[_0x60e05(0xc4)][_0x60e05(0xfc)];_0xda28d7['allStrLength']+=_0x1eacb7,_0xda28d7[_0x60e05(0xd4)]>_0xda28d7[_0x60e05(0x191)]?(_0x1bfe86['capped']='',delete _0x1bfe86[_0x60e05(0xc4)]):_0x1eacb7>_0x33f831&&(_0x1bfe86[_0x60e05(0x1ae)]=_0x1bfe86[_0x60e05(0xc4)][_0x60e05(0x172)](0x0,_0x33f831),delete _0x1bfe86[_0x60e05(0xc4)]);}},_0x568c0c['prototype']['_isMap']=function(_0x251695){var _0x2d4790=_0x4934b8;return!!(_0x251695&&_0x31f20b[_0x2d4790(0xd7)]&&this[_0x2d4790(0x1c7)](_0x251695)===_0x2d4790(0x16d)&&_0x251695['forEach']);},_0x568c0c[_0x4934b8(0x18a)]['_propertyName']=function(_0x2e0688){var _0x2c8644=_0x4934b8;if(_0x2e0688[_0x2c8644(0x11f)](/^\\d+$/))return _0x2e0688;var _0x91094;try{_0x91094=JSON[_0x2c8644(0x175)](''+_0x2e0688);}catch{_0x91094='\\x22'+this['_objectToString'](_0x2e0688)+'\\x22';}return _0x91094[_0x2c8644(0x11f)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x91094=_0x91094['substr'](0x1,_0x91094[_0x2c8644(0xfc)]-0x2):_0x91094=_0x91094[_0x2c8644(0x154)](/'/g,'\\x5c\\x27')[_0x2c8644(0x154)](/\\\\\"/g,'\\x22')[_0x2c8644(0x154)](/(^\"|\"$)/g,'\\x27'),_0x91094;},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x1a0)]=function(_0x232cbb,_0x29085f,_0x1650af,_0x1c890e){var _0x16a2a5=_0x4934b8;this[_0x16a2a5(0xc8)](_0x232cbb,_0x29085f),_0x1c890e&&_0x1c890e(),this[_0x16a2a5(0x1c9)](_0x1650af,_0x232cbb),this[_0x16a2a5(0x136)](_0x232cbb,_0x29085f);},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0xc8)]=function(_0x49291a,_0x33bdc6){var _0x52d41e=_0x4934b8;this[_0x52d41e(0x127)](_0x49291a,_0x33bdc6),this['_setNodeQueryPath'](_0x49291a,_0x33bdc6),this[_0x52d41e(0x15a)](_0x49291a,_0x33bdc6),this[_0x52d41e(0xe0)](_0x49291a,_0x33bdc6);},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x127)]=function(_0x3ffba9,_0x308291){},_0x568c0c[_0x4934b8(0x18a)]['_setNodeQueryPath']=function(_0x4befcf,_0x340320){},_0x568c0c['prototype'][_0x4934b8(0x19c)]=function(_0x6d004b,_0x3e0efe){},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x19e)]=function(_0x3b2948){var _0x1c5336=_0x4934b8;return _0x3b2948===this[_0x1c5336(0x12f)];},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x136)]=function(_0x571a40,_0x11152b){var _0x17c82d=_0x4934b8;this[_0x17c82d(0x19c)](_0x571a40,_0x11152b),this[_0x17c82d(0x16c)](_0x571a40),_0x11152b['sortProps']&&this[_0x17c82d(0x1af)](_0x571a40),this['_addFunctionsNode'](_0x571a40,_0x11152b),this['_addLoadNode'](_0x571a40,_0x11152b),this['_cleanNode'](_0x571a40);},_0x568c0c[_0x4934b8(0x18a)]['_additionalMetadata']=function(_0x25d425,_0x376ba0){var _0x4c6175=_0x4934b8;try{_0x25d425&&typeof _0x25d425[_0x4c6175(0xfc)]==_0x4c6175(0x1b2)&&(_0x376ba0[_0x4c6175(0xfc)]=_0x25d425[_0x4c6175(0xfc)]);}catch{}if(_0x376ba0[_0x4c6175(0x151)]===_0x4c6175(0x1b2)||_0x376ba0['type']===_0x4c6175(0xe7)){if(isNaN(_0x376ba0['value']))_0x376ba0[_0x4c6175(0xe5)]=!0x0,delete _0x376ba0[_0x4c6175(0xc4)];else switch(_0x376ba0[_0x4c6175(0xc4)]){case Number[_0x4c6175(0x102)]:_0x376ba0[_0x4c6175(0x130)]=!0x0,delete _0x376ba0['value'];break;case Number[_0x4c6175(0xf6)]:_0x376ba0[_0x4c6175(0x184)]=!0x0,delete _0x376ba0['value'];break;case 0x0:this['_isNegativeZero'](_0x376ba0['value'])&&(_0x376ba0[_0x4c6175(0xc3)]=!0x0);break;}}else _0x376ba0['type']==='function'&&typeof _0x25d425[_0x4c6175(0x1c3)]=='string'&&_0x25d425['name']&&_0x376ba0[_0x4c6175(0x1c3)]&&_0x25d425[_0x4c6175(0x1c3)]!==_0x376ba0[_0x4c6175(0x1c3)]&&(_0x376ba0[_0x4c6175(0x145)]=_0x25d425[_0x4c6175(0x1c3)]);},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x187)]=function(_0x3d5c0c){var _0x21909c=_0x4934b8;return 0x1/_0x3d5c0c===Number[_0x21909c(0xf6)];},_0x568c0c['prototype'][_0x4934b8(0x1af)]=function(_0xaf6d85){var _0x257f6e=_0x4934b8;!_0xaf6d85[_0x257f6e(0xfd)]||!_0xaf6d85['props'][_0x257f6e(0xfc)]||_0xaf6d85[_0x257f6e(0x151)]===_0x257f6e(0xfb)||_0xaf6d85[_0x257f6e(0x151)]===_0x257f6e(0xd7)||_0xaf6d85[_0x257f6e(0x151)]==='Set'||_0xaf6d85[_0x257f6e(0xfd)][_0x257f6e(0xee)](function(_0xcc5a49,_0x33a07){var _0x3d0ac0=_0x257f6e,_0x216c86=_0xcc5a49[_0x3d0ac0(0x1c3)][_0x3d0ac0(0x1bd)](),_0x52e92d=_0x33a07[_0x3d0ac0(0x1c3)][_0x3d0ac0(0x1bd)]();return _0x216c86<_0x52e92d?-0x1:_0x216c86>_0x52e92d?0x1:0x0;});},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0x18c)]=function(_0x26dd9a,_0x367b0a){var _0x3fb806=_0x4934b8;if(!(_0x367b0a[_0x3fb806(0x1bf)]||!_0x26dd9a['props']||!_0x26dd9a[_0x3fb806(0xfd)]['length'])){for(var _0x558538=[],_0x1e34a7=[],_0x4cf6c3=0x0,_0x496b22=_0x26dd9a[_0x3fb806(0xfd)]['length'];_0x4cf6c3<_0x496b22;_0x4cf6c3++){var _0x286ad8=_0x26dd9a[_0x3fb806(0xfd)][_0x4cf6c3];_0x286ad8[_0x3fb806(0x151)]===_0x3fb806(0x196)?_0x558538[_0x3fb806(0xff)](_0x286ad8):_0x1e34a7[_0x3fb806(0xff)](_0x286ad8);}if(!(!_0x1e34a7[_0x3fb806(0xfc)]||_0x558538[_0x3fb806(0xfc)]<=0x1)){_0x26dd9a[_0x3fb806(0xfd)]=_0x1e34a7;var _0x589572={'functionsNode':!0x0,'props':_0x558538};this[_0x3fb806(0x127)](_0x589572,_0x367b0a),this[_0x3fb806(0x19c)](_0x589572,_0x367b0a),this['_setNodeExpandableState'](_0x589572),this[_0x3fb806(0xe0)](_0x589572,_0x367b0a),_0x589572['id']+='\\x20f',_0x26dd9a['props'][_0x3fb806(0x1ac)](_0x589572);}}},_0x568c0c['prototype'][_0x4934b8(0xf9)]=function(_0x3a8156,_0x31dbc6){},_0x568c0c['prototype']['_setNodeExpandableState']=function(_0x27a91c){},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0xdc)]=function(_0x309bc7){var _0x3eff3d=_0x4934b8;return Array[_0x3eff3d(0x173)](_0x309bc7)||typeof _0x309bc7=='object'&&this['_objectToString'](_0x309bc7)==='[object\\x20Array]';},_0x568c0c[_0x4934b8(0x18a)]['_setNodePermissions']=function(_0x33a0fd,_0x133d76){},_0x568c0c[_0x4934b8(0x18a)][_0x4934b8(0xef)]=function(_0xd4834e){var _0x4c0797=_0x4934b8;delete _0xd4834e[_0x4c0797(0xe9)],delete _0xd4834e[_0x4c0797(0xf3)],delete _0xd4834e[_0x4c0797(0x1b7)];},_0x568c0c[_0x4934b8(0x18a)]['_setNodeExpressionPath']=function(_0x82227e,_0x5e328e){};let _0x4277ae=new _0x568c0c(),_0x578392={'props':_0x469d82[_0x4934b8(0x1cc)][_0x4934b8(0xfd)]||0x64,'elements':_0x469d82[_0x4934b8(0x1cc)]['elements']||0x64,'strLength':_0x469d82['defaultLimits']['strLength']||0x400*0x32,'totalStrLength':_0x469d82['defaultLimits'][_0x4934b8(0x191)]||0x400*0x32,'autoExpandLimit':_0x469d82['defaultLimits']['autoExpandLimit']||0x1388,'autoExpandMaxDepth':_0x469d82[_0x4934b8(0x1cc)]['autoExpandMaxDepth']||0xa},_0x1f746a={'props':_0x469d82[_0x4934b8(0x138)][_0x4934b8(0xfd)]||0x5,'elements':_0x469d82[_0x4934b8(0x138)][_0x4934b8(0xd2)]||0x5,'strLength':_0x469d82[_0x4934b8(0x138)][_0x4934b8(0x110)]||0x100,'totalStrLength':_0x469d82[_0x4934b8(0x138)][_0x4934b8(0x191)]||0x100*0x3,'autoExpandLimit':_0x469d82[_0x4934b8(0x138)][_0x4934b8(0x1a7)]||0x1e,'autoExpandMaxDepth':_0x469d82[_0x4934b8(0x138)][_0x4934b8(0x189)]||0x2};if(_0x2514c8){let _0x31c1e0=_0x4277ae['serialize'][_0x4934b8(0xf1)](_0x4277ae);_0x4277ae[_0x4934b8(0x158)]=function(_0x1957c4,_0xc0aeb7,_0x4ead78,_0x3625d6){return _0x31c1e0(_0x1957c4,_0x2514c8(_0xc0aeb7),_0x4ead78,_0x3625d6);};}function _0x1e6d74(_0x5afffa,_0x4a459c,_0x275938,_0x334fd3,_0x45c8dc,_0x17015d){var _0x490e67=_0x4934b8;let _0x97a821,_0x4538cb;try{_0x4538cb=_0x223738(),_0x97a821=_0x1f3bee[_0x4a459c],!_0x97a821||_0x4538cb-_0x97a821['ts']>_0x141946[_0x490e67(0x1cb)][_0x490e67(0xe6)]&&_0x97a821[_0x490e67(0x180)]&&_0x97a821['time']/_0x97a821[_0x490e67(0x180)]<_0x141946[_0x490e67(0x1cb)][_0x490e67(0x1b0)]?(_0x1f3bee[_0x4a459c]=_0x97a821={'count':0x0,'time':0x0,'ts':_0x4538cb},_0x1f3bee[_0x490e67(0x1cd)]={}):_0x4538cb-_0x1f3bee[_0x490e67(0x1cd)]['ts']>_0x141946[_0x490e67(0x13f)][_0x490e67(0xe6)]&&_0x1f3bee[_0x490e67(0x1cd)][_0x490e67(0x180)]&&_0x1f3bee['hits']['time']/_0x1f3bee['hits']['count']<_0x141946[_0x490e67(0x13f)]['resetOnProcessingTimeAverageMs']&&(_0x1f3bee[_0x490e67(0x1cd)]={});let _0x7ce882=[],_0x3afea7=_0x97a821['reduceLimits']||_0x1f3bee['hits']['reduceLimits']?_0x1f746a:_0x578392,_0x204f3a=_0x4e76b9=>{var _0x2f14d5=_0x490e67;let _0x5cb8da={};return _0x5cb8da[_0x2f14d5(0xfd)]=_0x4e76b9['props'],_0x5cb8da['elements']=_0x4e76b9[_0x2f14d5(0xd2)],_0x5cb8da[_0x2f14d5(0x110)]=_0x4e76b9[_0x2f14d5(0x110)],_0x5cb8da[_0x2f14d5(0x191)]=_0x4e76b9['totalStrLength'],_0x5cb8da['autoExpandLimit']=_0x4e76b9[_0x2f14d5(0x1a7)],_0x5cb8da[_0x2f14d5(0x189)]=_0x4e76b9[_0x2f14d5(0x189)],_0x5cb8da['sortProps']=!0x1,_0x5cb8da[_0x2f14d5(0x1bf)]=!_0x5c577b,_0x5cb8da[_0x2f14d5(0x15f)]=0x1,_0x5cb8da[_0x2f14d5(0x115)]=0x0,_0x5cb8da['expId']='root_exp_id',_0x5cb8da[_0x2f14d5(0xc6)]=_0x2f14d5(0x10d),_0x5cb8da[_0x2f14d5(0x104)]=!0x0,_0x5cb8da[_0x2f14d5(0x1b4)]=[],_0x5cb8da[_0x2f14d5(0x186)]=0x0,_0x5cb8da['resolveGetters']=_0x469d82[_0x2f14d5(0xcb)],_0x5cb8da[_0x2f14d5(0xd4)]=0x0,_0x5cb8da[_0x2f14d5(0x128)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0x5cb8da;};for(var _0x7432f7=0x0;_0x7432f7<_0x45c8dc['length'];_0x7432f7++)_0x7ce882[_0x490e67(0xff)](_0x4277ae[_0x490e67(0x158)]({'timeNode':_0x5afffa===_0x490e67(0x15e)||void 0x0},_0x45c8dc[_0x7432f7],_0x204f3a(_0x3afea7),{}));if(_0x5afffa===_0x490e67(0x17c)||_0x5afffa===_0x490e67(0x1bb)){let _0x5b3615=Error[_0x490e67(0x16f)];try{Error['stackTraceLimit']=0x1/0x0,_0x7ce882['push'](_0x4277ae[_0x490e67(0x158)]({'stackNode':!0x0},new Error()[_0x490e67(0x123)],_0x204f3a(_0x3afea7),{'strLength':0x1/0x0}));}finally{Error[_0x490e67(0x16f)]=_0x5b3615;}}return{'method':_0x490e67(0x116),'version':_0x4a0483,'args':[{'ts':_0x275938,'session':_0x334fd3,'args':_0x7ce882,'id':_0x4a459c,'context':_0x17015d}]};}catch(_0x84cbeb){return{'method':_0x490e67(0x116),'version':_0x4a0483,'args':[{'ts':_0x275938,'session':_0x334fd3,'args':[{'type':_0x490e67(0x16e),'error':_0x84cbeb&&_0x84cbeb[_0x490e67(0x188)]}],'id':_0x4a459c,'context':_0x17015d}]};}finally{try{if(_0x97a821&&_0x4538cb){let _0x432ee2=_0x223738();_0x97a821['count']++,_0x97a821['time']+=_0x42fb36(_0x4538cb,_0x432ee2),_0x97a821['ts']=_0x432ee2,_0x1f3bee[_0x490e67(0x1cd)][_0x490e67(0x180)]++,_0x1f3bee[_0x490e67(0x1cd)][_0x490e67(0x15e)]+=_0x42fb36(_0x4538cb,_0x432ee2),_0x1f3bee[_0x490e67(0x1cd)]['ts']=_0x432ee2,(_0x97a821[_0x490e67(0x180)]>_0x141946[_0x490e67(0x1cb)][_0x490e67(0x12d)]||_0x97a821['time']>_0x141946[_0x490e67(0x1cb)][_0x490e67(0x1bc)])&&(_0x97a821[_0x490e67(0x171)]=!0x0),(_0x1f3bee['hits']['count']>_0x141946[_0x490e67(0x13f)][_0x490e67(0x12d)]||_0x1f3bee[_0x490e67(0x1cd)][_0x490e67(0x15e)]>_0x141946[_0x490e67(0x13f)]['reduceOnAccumulatedProcessingTimeMs'])&&(_0x1f3bee[_0x490e67(0x1cd)]['reduceLimits']=!0x0);}}catch{}}}return _0x1e6d74;}function _0x2214(){var _0x14499a=['value','undefined','rootExpression','path','_treeNodePropertiesBeforeFullValue','origin','data','resolveGetters','_addProperty','expo','_blacklistedProperty','_getOwnPropertyDescriptor','timeStamp','failed\\x20to\\x20connect\\x20to\\x20host:\\x20','elements','null','allStrLength','_regExpToString','react-native','Map','2eFQllr','ninjaSuppressConsole',',\\x20see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','coverage','_isArray','_connected','hrtime','toString','_setNodePermissions','bound\\x20Promise','reducePolicy','_reconnectTimeout','...','nan','resetWhenQuietMs','Number','_ninjaIgnoreNextError','_hasSymbolPropertyOnItsPath','current','Set','import(\\x27url\\x27)','bigint','sort','_cleanNode','_connectToHostNow','bind','catch','_hasSetOnItsPath','\\x20server','get','NEGATIVE_INFINITY','1.0.0','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','_addLoadNode','_consoleNinjaAllowedToStart','array','length','props','_p_name','push','performance','location','POSITIVE_INFINITY','date','autoExpand','10162370kgItlO','map','disabledTrace','10.0.2.2','_numberRegExp','env','symbol','resolve','root_exp','onmessage','test','strLength','port','concat','_WebSocket','then','level','log','_addObjectProperty','object','_isSet','getOwnPropertyDescriptor','Error','isExpressionToEvaluate','edge','charAt','match','parent','indexOf','valueOf','stack','warn','_connecting','failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','_setNodeId','node','next.js','versions','1668317DHAXqx','_property','reduceOnCount','_getOwnPropertySymbols','_undefined','positiveInfinity','_propertyName','_dateToString','_sendErrorMessage','gateway.docker.internal','remix','_treeNodePropertiesAfterFullValue','984054cwWOKG','reducedLimits','_capIfString','_keyStrRegExp','cappedProps','_attemptToReconnectShortly','_socket','reload','global','endsWith','args','RegExp','_extendedWarning','onerror','funcName','_isPrimitiveWrapperType','_disposeWebsocket','next.js','[object\\x20BigInt]','index','_maxConnectAttemptCount','[object\\x20Array]',\"/home/jerlibgnzlz/.vscode/extensions/wallabyjs.console-ninja-1.0.493/node_modules\",'getOwnPropertyNames','constructor','dockerizedApp','type','142700orZAYJ','includes','replace','39777','hasOwnProperty','boolean','serialize','_quotedRegExp','_setNodeExpressionPath','unref','join','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help;\\x20also\\x20see\\x20','time','depth','modules','_HTMLAllCollection','slice','method','nodeModules','_console_ninja','parse','415197WHEhXo','elapsed','process','eventReceivedCallback','getOwnPropertySymbols','_setNodeExpandableState','[object\\x20Map]','unknown','stackTraceLimit','see\\x20https://tinyurl.com/2vt8jxzw\\x20for\\x20more\\x20info.','reduceLimits','substr','isArray','_allowedToSend','stringify','console','disabledLog','_Symbol','_webSocketErrorDocsLink','_getOwnPropertyNames','getter','trace','send','_p_','[object\\x20Set]','count','','_allowedToConnectOnSend','hostname','negativeInfinity','set','autoExpandPropertyCount','_isNegativeZero','message','autoExpandMaxDepth','prototype','iterator','_addFunctionsNode','https://tinyurl.com/37x8b79t','angular','127.0.0.1','import(\\x27path\\x27)','totalStrLength','host','NEXT_RUNTIME','_ws','call','function','5lYlfxC','56GExRSR','Boolean','1563852BMXApG',{\"resolveGetters\":false,\"defaultLimits\":{\"props\":100,\"elements\":100,\"strLength\":51200,\"totalStrLength\":51200,\"autoExpandLimit\":5000,\"autoExpandMaxDepth\":10},\"reducedLimits\":{\"props\":5,\"elements\":5,\"strLength\":256,\"totalStrLength\":768,\"autoExpandLimit\":30,\"autoExpandMaxDepth\":2},\"reducePolicy\":{\"perLogpoint\":{\"reduceOnCount\":50,\"reduceOnAccumulatedProcessingTimeMs\":100,\"resetWhenQuietMs\":500,\"resetOnProcessingTimeAverageMs\":100},\"global\":{\"reduceOnCount\":1000,\"reduceOnAccumulatedProcessingTimeMs\":300,\"resetWhenQuietMs\":50,\"resetOnProcessingTimeAverageMs\":100}}},'_setNodeLabel','_isPrimitiveType','_isUndefined','Symbol','_processTreeNodeResult','_WebSocketClass','ExpoDevice','_isMap','default','_console_ninja_session','now','autoExpandLimit','android','string','11djOgAe','HTMLAllCollection','unshift','_type','capped','_sortProps','resetOnProcessingTimeAverageMs','_inBrowser','number','url','autoExpandPreviousObjects','WebSocket','toUpperCase','_hasMapOnItsPath','[object\\x20Date]','cappedElements','forEach','error','reduceOnAccumulatedProcessingTimeMs','toLowerCase','_connectAttemptCount','noFunctions','207488XhRovp','return\\x20import(url.pathToFileURL(path.join(nodeModules,\\x20\\x27ws/index.js\\x27)).toString());','split','name','logger\\x20websocket\\x20error','getWebSocketClass',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"10.0.2.2\",\"cdr\",\"192.168.0.33\",\"172.19.0.1\"],'_objectToString','String','_additionalMetadata','readyState','perLogpoint','defaultLimits','hits','expressionsToEvaluate','negativeZero'];_0x2214=function(){return _0x14499a;};return _0x2214();}function G(_0x3130d3){var _0x84a520=_0x54cc26;if(_0x3130d3&&typeof _0x3130d3==_0x84a520(0x118)&&_0x3130d3[_0x84a520(0x14f)])switch(_0x3130d3[_0x84a520(0x14f)][_0x84a520(0x1c3)]){case'Promise':return _0x3130d3[_0x84a520(0x156)](Symbol[_0x84a520(0x18b)])?Promise['resolve']():_0x3130d3;case _0x84a520(0xe1):return Promise[_0x84a520(0x10c)]();}return _0x3130d3;}function _0x4a90(_0xbf85a4,_0x245df9){var _0x2214cf=_0x2214();return _0x4a90=function(_0x4a90b3,_0x346472){_0x4a90b3=_0x4a90b3-0xc3;var _0x3eefbb=_0x2214cf[_0x4a90b3];return _0x3eefbb;},_0x4a90(_0xbf85a4,_0x245df9);}((_0x3cca3d,_0xf824c0,_0x3e0a9b,_0x5c058d,_0x38abea,_0x269295,_0x304d0c,_0x56b187,_0x5799d3,_0x19f830,_0x5a3a2e,_0x231e3c)=>{var _0x4818fc=_0x54cc26;if(_0x3cca3d[_0x4818fc(0x165)])return _0x3cca3d[_0x4818fc(0x165)];let _0x52e3da={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoLogMany':()=>{},'autoTraceMany':()=>{},'coverage':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}};if(!X(_0x3cca3d,_0x56b187,_0x38abea))return _0x3cca3d[_0x4818fc(0x165)]=_0x52e3da,_0x3cca3d['_console_ninja'];let _0x44b593=b(_0x3cca3d),_0x48380c=_0x44b593[_0x4818fc(0x168)],_0x1338d8=_0x44b593[_0x4818fc(0xd0)],_0x29d139=_0x44b593[_0x4818fc(0x1a6)],_0x1ed58e={'hits':{},'ts':{}},_0x19f55c=J(_0x3cca3d,_0x5799d3,_0x1ed58e,_0x269295,_0x231e3c,_0x38abea===_0x4818fc(0x129)?G:void 0x0),_0x59946f=(_0x57c8c4,_0x2ff1c0,_0x1589b0,_0x5826e5,_0xd0311c,_0x2786a0)=>{var _0x40d17e=_0x4818fc;let _0x218bcb=_0x3cca3d['_console_ninja'];try{return _0x3cca3d['_console_ninja']=_0x52e3da,_0x19f55c(_0x57c8c4,_0x2ff1c0,_0x1589b0,_0x5826e5,_0xd0311c,_0x2786a0);}finally{_0x3cca3d[_0x40d17e(0x165)]=_0x218bcb;}},_0x22921d=_0x423627=>{_0x1ed58e['ts'][_0x423627]=_0x1338d8();},_0x45102e=(_0x88203,_0x370b7a)=>{var _0x9ec8e9=_0x4818fc;let _0x3d041a=_0x1ed58e['ts'][_0x370b7a];if(delete _0x1ed58e['ts'][_0x370b7a],_0x3d041a){let _0x52a6eb=_0x48380c(_0x3d041a,_0x1338d8());_0x312a62(_0x59946f(_0x9ec8e9(0x15e),_0x88203,_0x29d139(),_0x9b859d,[_0x52a6eb],_0x370b7a));}},_0x2ee867=_0x41fceb=>{var _0x5bbca8=_0x4818fc,_0x5ba44d;return _0x38abea==='next.js'&&_0x3cca3d[_0x5bbca8(0xc9)]&&((_0x5ba44d=_0x41fceb==null?void 0x0:_0x41fceb[_0x5bbca8(0x141)])==null?void 0x0:_0x5ba44d[_0x5bbca8(0xfc)])&&(_0x41fceb['args'][0x0][_0x5bbca8(0xc9)]=_0x3cca3d[_0x5bbca8(0xc9)]),_0x41fceb;};_0x3cca3d[_0x4818fc(0x165)]={'consoleLog':(_0x1d0443,_0x2f73e4)=>{var _0x97f6bc=_0x4818fc;_0x3cca3d[_0x97f6bc(0x176)][_0x97f6bc(0x116)][_0x97f6bc(0x1c3)]!==_0x97f6bc(0x177)&&_0x312a62(_0x59946f(_0x97f6bc(0x116),_0x1d0443,_0x29d139(),_0x9b859d,_0x2f73e4));},'consoleTrace':(_0x4f29ba,_0x40e0fb)=>{var _0x5ea07f=_0x4818fc,_0xb083e5,_0x274db5;_0x3cca3d[_0x5ea07f(0x176)][_0x5ea07f(0x116)][_0x5ea07f(0x1c3)]!==_0x5ea07f(0x107)&&((_0x274db5=(_0xb083e5=_0x3cca3d['process'])==null?void 0x0:_0xb083e5[_0x5ea07f(0x12a)])!=null&&_0x274db5[_0x5ea07f(0x128)]&&(_0x3cca3d[_0x5ea07f(0xe8)]=!0x0),_0x312a62(_0x2ee867(_0x59946f(_0x5ea07f(0x17c),_0x4f29ba,_0x29d139(),_0x9b859d,_0x40e0fb))));},'consoleError':(_0x2bc0da,_0x1c2aec)=>{var _0x1781f6=_0x4818fc;_0x3cca3d[_0x1781f6(0xe8)]=!0x0,_0x312a62(_0x2ee867(_0x59946f(_0x1781f6(0x1bb),_0x2bc0da,_0x29d139(),_0x9b859d,_0x1c2aec)));},'consoleTime':_0x39580d=>{_0x22921d(_0x39580d);},'consoleTimeEnd':(_0x3bc815,_0x207b89)=>{_0x45102e(_0x207b89,_0x3bc815);},'autoLog':(_0x1feae7,_0x412215)=>{var _0x28d3ed=_0x4818fc;_0x312a62(_0x59946f(_0x28d3ed(0x116),_0x412215,_0x29d139(),_0x9b859d,[_0x1feae7]));},'autoLogMany':(_0x2ec4aa,_0x3ebbc7)=>{_0x312a62(_0x59946f('log',_0x2ec4aa,_0x29d139(),_0x9b859d,_0x3ebbc7));},'autoTrace':(_0x1181a3,_0x59d6b5)=>{_0x312a62(_0x2ee867(_0x59946f('trace',_0x59d6b5,_0x29d139(),_0x9b859d,[_0x1181a3])));},'autoTraceMany':(_0x5d59ec,_0x321085)=>{var _0x254ed6=_0x4818fc;_0x312a62(_0x2ee867(_0x59946f(_0x254ed6(0x17c),_0x5d59ec,_0x29d139(),_0x9b859d,_0x321085)));},'autoTime':(_0x221590,_0x1740ad,_0x144e01)=>{_0x22921d(_0x144e01);},'autoTimeEnd':(_0x37d7ca,_0x1b7b6f,_0x52089f)=>{_0x45102e(_0x1b7b6f,_0x52089f);},'coverage':_0x2fe387=>{var _0xeb334b=_0x4818fc;_0x312a62({'method':_0xeb334b(0xdb),'version':_0x269295,'args':[{'id':_0x2fe387}]});}};let _0x312a62=H(_0x3cca3d,_0xf824c0,_0x3e0a9b,_0x5c058d,_0x38abea,_0x19f830,_0x5a3a2e),_0x9b859d=_0x3cca3d[_0x4818fc(0x1a5)];return _0x3cca3d[_0x4818fc(0x165)];})(globalThis,_0x54cc26(0x18f),_0x54cc26(0x155),_0x54cc26(0x14d),_0x54cc26(0x148),_0x54cc26(0xf7),'1763758332575',_0x54cc26(0x1c6),_0x54cc26(0x181),'','1',_0x54cc26(0x19b));");
    } catch (e) {
        console.error(e);
    }
}
function oo_oo(i, ...v) {
    try {
        oo_cm().consoleLog(i, v);
    } catch (e) {}
    return v;
}
oo_oo; /* istanbul ignore next */ 
function oo_tr(i, ...v) {
    try {
        oo_cm().consoleTrace(i, v);
    } catch (e) {}
    return v;
}
oo_tr; /* istanbul ignore next */ 
function oo_tx(i, ...v) {
    try {
        oo_cm().consoleError(i, v);
    } catch (e) {}
    return v;
}
oo_tx; /* istanbul ignore next */ 
function oo_ts(v) {
    try {
        oo_cm().consoleTime(v);
    } catch (e) {}
    return v;
}
oo_ts; /* istanbul ignore next */ 
function oo_te(v, i) {
    try {
        oo_cm().consoleTimeEnd(v, i);
    } catch (e) {}
    return v;
}
oo_te; /*eslint unicorn/no-abusive-eslint-disable:,eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/ 
var _c;
__turbopack_context__.k.register(_c, "PastoresPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Escritorio_v0-project-setup-and-plan_bf3aff06._.js.map