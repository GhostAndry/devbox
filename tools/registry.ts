import type { ComponentType } from "react";

/**
 * Dynamic tool registry.
 *
 * To add a new tool:
 * 1. Create a file in `tools/` (e.g. `tools/uuid-generator.tsx`)
 * 2. Export a default component from that file
 * 3. Import it here and add it to the registry
 *
 * The sidebar and routing are handled automatically by `lib/tools.ts`.
 */
export const dynamicRegistry: Record<string, ComponentType> = {};

// ── Lazy-loaded tool imports ────────────────────────────────────────────────
// Tools are imported lazily to keep the initial bundle small.
// As you add tools, import them here and register them in the registry.

import UuidGenerator from "./uuid-generator";
dynamicRegistry["uuid-generator"] = UuidGenerator;

import JsonFormatter from "./json-formatter";
dynamicRegistry["json-formatter"] = JsonFormatter;

import Base64Tool from "./base64";
dynamicRegistry["base64"] = Base64Tool;

import HashGenerator from "./hash-generator";
dynamicRegistry["hash-generator"] = HashGenerator;

import TimestampConverter from "./timestamp-converter";
dynamicRegistry["timestamp-converter"] = TimestampConverter;

import ColorPicker from "./color-picker";
dynamicRegistry["color-picker"] = ColorPicker;

import CaseConverter from "./case-converter";
dynamicRegistry["case-converter"] = CaseConverter;

import LoremIpsum from "./lorem-ipsum";
dynamicRegistry["lorem-ipsum"] = LoremIpsum;

import PasswordGenerator from "./password-generator";
dynamicRegistry["password-generator"] = PasswordGenerator;

import RegexPlayground from "./regex-playground";
dynamicRegistry["regex-playground"] = RegexPlayground;

import UrlEncoder from "./url-encoder";
dynamicRegistry["url-encoder"] = UrlEncoder;

import JwtDecoder from "./jwt-decoder";
dynamicRegistry["jwt-decoder"] = JwtDecoder;

import ChmodCalculator from "./chmod-calculator";
dynamicRegistry["chmod-calculator"] = ChmodCalculator;

import NumberBaseConverter from "./number-base-converter";
dynamicRegistry["number-base-converter"] = NumberBaseConverter;

import HttpStatusCodeExplorer from "./http-status";
dynamicRegistry["http-status"] = HttpStatusCodeExplorer;

import NanoidGenerator from "./nanoid-generator";
dynamicRegistry["nanoid-generator"] = NanoidGenerator;

import TokenGenerator from "./token-generator";
dynamicRegistry["token-generator"] = TokenGenerator;

import MarkdownPreview from "./markdown-preview";
dynamicRegistry["markdown-preview"] = MarkdownPreview;

import TextDiff from "./text-diff";
dynamicRegistry["text-diff"] = TextDiff;

import HtmlEscape from "./html-escape";
dynamicRegistry["html-escape"] = HtmlEscape;

import CronGenerator from "./cron-generator";
dynamicRegistry["cron-generator"] = CronGenerator;

import CssGradient from "./css-gradient";
dynamicRegistry["css-gradient"] = CssGradient;

import CidrCalculator from "./cidr-calculator";
dynamicRegistry["cidr-calculator"] = CidrCalculator;

import GitCheatsheet from "./git-cheatsheet";
dynamicRegistry["git-cheatsheet"] = GitCheatsheet;

import FakeJson from "./fake-json";
dynamicRegistry["fake-json"] = FakeJson;

import JsonToYaml from "./json-to-yaml";
dynamicRegistry["json-to-yaml"] = JsonToYaml;

import UrlParser from "./url-parser";
dynamicRegistry["url-parser"] = UrlParser;

import MimeLookup from "./mime-lookup";
dynamicRegistry["mime-lookup"] = MimeLookup;

import DockerCompose from "./docker-compose";
dynamicRegistry["docker-compose"] = DockerCompose;

import DockerfileCreator from "./dockerfile-creator";
dynamicRegistry["dockerfile-creator"] = DockerfileCreator;

import QrCode from "./qr-code";
dynamicRegistry["qr-code"] = QrCode;

import JsonTemplateGenerator from "./json-template-generator";
dynamicRegistry["json-template-generator"] = JsonTemplateGenerator;