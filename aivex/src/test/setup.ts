import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

Element.prototype.animate = vi.fn() as unknown as typeof Element.prototype.animate;
