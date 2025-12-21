import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * HATI CONCIERGE SERVICE
 * Handles support ticket creation and management
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, message, ticketType, attachments } = body;

    // Validate required fields
    if (!userId || !subject || !message || !ticketType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Create support ticket
    const ticketRef = await adminDb.collection('support_tickets').add({
      userId,
      userEmail: userData?.email,
      userName: userData?.name,
      subject,
      message,
      type: ticketType, // 'technical', 'billing', 'medical', 'general'
      status: 'open',
      priority: ticketType === 'medical' ? 'high' : 'normal',
      attachments: attachments || [],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      responses: [],
      assignedAgent: null,
      resolvedAt: null,
    });

    // Create notification for admin
    await adminDb.collection('admin_notifications').add({
      type: 'new_ticket',
      ticketId: ticketRef.id,
      userId,
      subject,
      priority: ticketType === 'medical' ? 'high' : 'normal',
      createdAt: admin.firestore.Timestamp.now(),
      read: false,
    });

    // Log concierge activity
    await adminDb.collection('activity_logs').add({
      action: 'concierge_ticket_created',
      userId,
      ticketId: ticketRef.id,
      ticketType,
      timestamp: admin.firestore.Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      ticketId: ticketRef.id,
      message: 'Support ticket created successfully',
    });
  } catch (error: any) {
    console.error('CONCIERGE_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

/**
 * GET support ticket details
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('ticketId');
    const userId = searchParams.get('userId');

    if (ticketId) {
      // Get specific ticket
      const ticketDoc = await adminDb.collection('support_tickets').doc(ticketId).get();
      if (!ticketDoc.exists()) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(ticketDoc.data());
    } else if (userId) {
      // Get all tickets for user
      const ticketsSnapshot = await adminDb
        .collection('support_tickets')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const tickets = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ tickets });
    } else {
      return NextResponse.json(
        { error: 'ticketId or userId required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('GET_TICKET_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ticket' },
      { status: 500 }
    );
  }
}

/**
 * UPDATE support ticket (add response, change status, assign agent)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, action, data } = body;

    if (!ticketId || !action) {
      return NextResponse.json(
        { error: 'Missing ticketId or action' },
        { status: 400 }
      );
    }

    const ticketRef = adminDb.collection('support_tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists()) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (action === 'add_response') {
      // Add response from support agent
      const { agentName, responseText } = data;
      await ticketRef.update({
        responses: admin.firestore.FieldValue.arrayUnion({
          agent: agentName,
          message: responseText,
          timestamp: admin.firestore.Timestamp.now(),
        }),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    } else if (action === 'change_status') {
      // Update ticket status (open, in_progress, resolved, closed)
      const { status } = data;
      const updateData: any = {
        status,
        updatedAt: admin.firestore.Timestamp.now(),
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = admin.firestore.Timestamp.now();
      }

      await ticketRef.update(updateData);
    } else if (action === 'assign_agent') {
      // Assign support agent
      const { agentId } = data;
      await ticketRef.update({
        assignedAgent: agentId,
        status: 'in_progress',
        updatedAt: admin.firestore.Timestamp.now(),
      });
    } else {
      return NextResponse.json(
        { error: 'Unknown action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Ticket updated with action: ${action}`,
    });
  } catch (error: any) {
    console.error('UPDATE_TICKET_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
