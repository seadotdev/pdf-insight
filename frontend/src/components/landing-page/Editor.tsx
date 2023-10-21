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


