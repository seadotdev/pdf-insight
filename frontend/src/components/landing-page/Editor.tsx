import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';
import Script from 'next/script';
import { backendClient } from "~/api/backendClient";

import { backendUrl } from "~/config";
import useMessages from "~/hooks/useMessages";
import { MESSAGE_STATUS, type Message } from "~/types/conversation";
import { RenderConversations } from "~/components/conversations/RenderConversations";
import { BsArrowUpCircle } from "react-icons/bs";
import useLocalStorage from "~/hooks/utils/useLocalStorage";

import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';

export default function Editor() {

    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        
        <script type="text/jsx">
            ReactDOM.render(
            <ForceGraph3D graphData={genRandomTree()}/>,
            document.getElementById('graph')
            );
        </script>
      </div>
    );
  }