// types.ts
import { dia } from '@joint/core';

export interface LinkableElementPorts extends dia.Element.Port {
        groups: {
                top: dia.Element.PortGroup;
                right: dia.Element.PortGroup;
                bottom: dia.Element.PortGroup;
                left: dia.Element.PortGroup;
        };
}

export interface LinkableElementAttributes extends dia.Element.Attributes {
        ports: LinkableElementPorts;
}